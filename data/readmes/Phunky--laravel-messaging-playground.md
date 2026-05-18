# laravel-messaging-playground

A **reference Laravel application** that shows how the **[Laravel Messaging](https://github.com/Phunky/laravel-messaging)** family of packages fits together in a real UI. It is not a generic chat starter kit: it is a **living demo** you can run locally to see conversations, groups, reactions, attachments, read receipts, and live updates end to end.


| Repository                                                                               | What you see in the playground                                                                |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [laravel-messaging](https://github.com/Phunky/laravel-messaging)                         | Conversations, participants, messages, messaging events (delivery/read), extension points.    |
| [laravel-messaging-groups](https://github.com/Phunky/laravel-messaging-groups)           | Group threads, membership, and group-backed conversations in the inbox.                       |
| [laravel-messaging-reactions](https://github.com/Phunky/laravel-messaging-reactions)     | Emoji reactions on messages in both DMs and groups.                                           |
| [laravel-messaging-attachments](https://github.com/Phunky/laravel-messaging-attachments) | Rich attachments (e.g. images, documents, voice notes) in the thread and viewers where wired. |


### What you can find built here

- **Inbox + thread**: pick a conversation from the list; on small screens the layout switches between list and thread (“mobile stack”) like common messaging apps.
- **Direct messages**: one seeded DM per peer with the demo user so you can scroll history and compare with group threads.
- **Groups**: several seeded groups with varied membership and message volume.
- **Reactions**: sample reactions on a subset of messages to exercise the reactions package in context.
- **Read / unread**: the seeder writes `message.received` and `message.read` events and leaves a few incoming messages without a read event so the inbox can show realistic unread state.
- **Real time**: with Reverb running and Echo configured, opening the same conversation in two browsers shows new messages and relevant events without a manual refresh.

### HTTP API (mobile / headless clients)

**OpenAPI 3** spec: `[openapi/openapi.yaml](openapi/openapi.yaml)` (auth, chat Restify actions, broadcasting auth, and a shallow outline of Restify resource indexes).

Authentication uses **Laravel Sanctum** personal access tokens. Chat-specific behavior is exposed through **Laravel Restify** repositories plus **standalone actions** that call the same domain layer as the Livewire UI.

#### Issue and revoke a token


| Method | Path               | Notes                                                                                                                                              |
| ------ | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST` | `/api/auth/token`  | JSON body: `email`, `password`, `device_name` (required). Returns `token`, `token_type` (`Bearer`), and a small `user` object. Throttled (10/min). |
| `POST` | `/api/auth/logout` | Requires `Authorization: Bearer {token}`. Deletes the **current** personal access token.                                                           |
| `GET`  | `/api/user`        | Current authenticated user (`auth:sanctum`).                                                                                                       |


Send `Authorization: Bearer {plainTextToken}` on all protected requests.

#### Restify resources

- Base path: `/api/restify/…`
- Repository URI keys: `users`, `conversations`, `messages` (e.g. `GET /api/restify/conversations`).

Standard **index/show/store** responses use Restify’s **JSON:API-style** envelopes (`data`, `meta`, `links` where applicable). Message **update/destroy** via default Restify routes are intentionally restricted; use the message actions below for edit/delete/send.

#### Chat actions (custom JSON responses)

Invoke a repository action with:

`POST /api/restify/{repository}/actions?action={action-uri-key}`

Use `Content-Type: application/json` unless noted. All actions require a valid Bearer token.

`**conversations` repository**


| `action` query value            | Body (JSON)                                        | Response (shape)                  |
| ------------------------------- | -------------------------------------------------- | --------------------------------- |
| `conversation-inbox-action`     | `cursor` optional string                           | `{ rows, next_cursor, has_more }` |
| `mark-conversation-read-action` | `conversation_id` (int)                            | `{ ok: true }` or `403`           |
| `conversation-media-action`     | `conversation_id` (int), `message_id` optional int | `{ items: [...] }`                |


`**messages` repository**


| `action` query value     | Body                                                                                                                                                                                                                                                                  | Response (shape)                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `thread-messages-action` | `conversation_id` (int), `cursor` optional string                                                                                                                                                                                                                     | `{ messages, next_cursor, has_more }`                                                                             |
| `send-message-action`    | `**multipart/form-data`**: `conversation_id`, `body` (optional), `attachment_kind` (required), `attachments[]` files (optional). Allowed `attachment_kind` values are the keys of `config('messaging.media_attachment_types')` (see `MessageAttachmentTypeRegistry`). | `201` with `{ message: ... }` serialized for the viewer, or `422` with `{ message }` on validation/domain errors. |
| `toggle-reaction-action` | JSON: `conversation_id`, `message_id`, `reaction` (string)                                                                                                                                                                                                            | `{ ok: true }` or `422`                                                                                           |
| `edit-message-action`    | JSON: `conversation_id`, `message_id`, `body`                                                                                                                                                                                                                         | `{ message: ... }` or `422`                                                                                       |
| `delete-message-action`  | JSON: `conversation_id`, `message_id`                                                                                                                                                                                                                                 | `204 No Content` or `422`                                                                                         |


#### Real-time (Echo / Reverb)

`Broadcast::routes` is registered with `auth:sanctum`, so clients can authorize private channels using the **same** Bearer token when the Echo driver is configured for token auth.

- **User private channel**: `private-App.Models.User.{userId}` (matches `routes/channels.php`).
- **Conversation channel**: `private-messaging.conversation.{conversationId}` — only participants pass authorization.

The web UI uses **whispers** on the conversation channel for typing/recording indicators; API clients can subscribe to the same channel for parity or rely on polling REST only.