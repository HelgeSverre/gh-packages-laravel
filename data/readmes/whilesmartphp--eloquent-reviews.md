# WhileSmart Reviews Package

Polymorphic reviews package for Laravel that allows any model to be reviewable.

## Installation

Already installed in this project via local autoloading.

## Usage

### Making a Model Reviewable

Add the `Reviewable` trait to any model:

```php
use Whilesmart\Reviews\Traits\Reviewable;

class DocumentSubmission extends Model
{
    use Reviewable;

    // ... rest of model
}
```

### Review a Model

```php
// Accept a document submission
$submission->accept(
    reviewerId: $user->id,
    notes: 'Document looks good',
    metadata: ['ip_address' => request()->ip()]
);

// Reject with reason
$submission->reject(
    reviewerId: $user->id,
    notes: 'Document is expired, please resubmit',
    metadata: ['rejection_reason' => 'expired']
);

// Custom review
$submission->addReview(
    reviewerId: $user->id,
    status: 'flagged',
    notes: 'Needs manual verification',
    metadata: []
);
```

### Query Reviews

```php
// Get all reviews
$reviews = $submission->reviews;

// Get latest review
$latestReview = $submission->latestReview;

// Check status
if ($submission->isAccepted()) {
    // Document was accepted
}

if ($submission->isRejected()) {
    // Document was rejected
}

// Get review details
$status = $submission->getReviewStatus(); // 'accepted', 'rejected', etc.
$notes = $submission->getReviewNotes();
```

### Query by Review Status

```php
// Get all accepted submissions
$acceptedSubmissions = DocumentSubmission::whereHas('reviews', function($q) {
    $q->accepted();
})->get();

// Get all rejected submissions
$rejectedSubmissions = DocumentSubmission::whereHas('reviews', function($q) {
    $q->rejected();
})->get();
```

## Models That Can Use Reviewable

- `DocumentSubmission` - Review individual document submissions
- `DocumentVersion` - Review specific versions of documents
- `SubmissionBatch` - Review entire batches of submissions
- Any other model that needs review functionality

## Database Structure

The `reviews` table has these fields:
- `reviewable_type` & `reviewable_id` - Polymorphic relationship
- `reviewer_id` - User who performed the review
- `status` - 'pending', 'accepted', 'rejected', 'flagged'
- `notes` - Review comments/reasons
- `reviewed_at` - Timestamp of review
- `metadata` - JSON field for additional data

## Extending the Package

This package is designed to be extracted into a standalone package later. Keep all reviews logic contained within this directory.
