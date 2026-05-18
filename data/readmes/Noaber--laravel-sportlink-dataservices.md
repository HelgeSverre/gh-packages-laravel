# KNVB Club Data Service

A Laravel wrapper for the KNVB / Sportlink Club.Data API.

## Overview

This package provides a small set of Laravel-friendly services for working with Club.Data endpoints, including:

- team data
- match data
- ranking and poule data

It is designed to keep API access simple and consistent inside Laravel applications.

## Requirements

- PHP 8.2+
- Laravel 11 or 12

## Installation

Install the package with Composer:

Laravel should automatically discover the service provider.

## Configuration

Set your Club.Data client ID in your environment file:

Default configuration values:

- Base URI: `https://data.sportlink.com/`
- Client ID: loaded from `SPORTLINK_CLUB_DATA_CLIENT_ID`

If you want to customize configuration, copy the package config into your application and adjust it as needed.

## Getting Started

After installation and configuration, resolve one of the services from the container and call the desired method.

### Example

## Available Services

### `SportLinkService`

Base service used for making authenticated API requests.

### `SportLinkTeamService`

Methods:

- `getTeams(array $args = [])`
- `getTeam(int $teamCode, int $localTeamCode, array $args = [])`
- `getTeamData(int $teamCode, int $localTeamCode)`
- `getTeamSponsors(int $teamCode, int $localTeamCode)`

### `SportLinkMatchService`

Methods:

- `getMatches(array $args = [])`
- `getMatchResults(array $args = [])`
- `getPostponements(array $args = [])`
- `getMatchDetails(int $matchCode)`
- `getMatchParticipants(int $matchCode)`
- `getMatchHomeTeam(int $matchCode, bool $showPlayerPhoto = false)`
- `getMatchAwayTeam(int $matchCode, bool $showPlayerPhoto = false)`
- `getMatchOfficials(int $matchCode)`
- `getMatchVenue(int $matchCode)`
- `getMatchLockerRooms(int $matchCode)`
- `getMatchStatistics(int $matchCode)`
- `getMatchHistoricalResults(int $matchCode)`

### `SportLinkRankingService`

Methods:

- `getGroupStandings(string|int $groupCode, array $args = [])`
- `getPeriodStandings(string|int $groupCode, int $periodNumber = -1)`
- `getGroupLineup(string|int $groupCode)`
- `getGroupSchedule(string|int $groupCode, array $args = [])`
- `getGroupResults(string|int $groupCode, array $args = [])`
- `getGroupList()`
- `getTeamGroupList(int $teamCode, int $localTeamCode)`

## Notes

- All requests are performed through Laravel's HTTP client.
- The client ID is automatically added to every API request.
- Methods accept optional argument arrays where supported, allowing you to override default query parameters.

## License

MIT