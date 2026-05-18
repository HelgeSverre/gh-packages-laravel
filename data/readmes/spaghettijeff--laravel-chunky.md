# laravel-chunky
A simple chunked and resumable file uploader that integrates with Laravel's file storage system. Includes a small javascript library for client side uploading.

## Usage
To publish the package config and javascript library.
```bash
php artisan vendor:publish --provider='spaghettijeff\chunky\ChunkyServiceProvider'
```

### Server
Two routes must be defined. A POST route that is used to start/finish/resume and upload, and a PATCH route where chunks will be uploaded.
```php
Route::post('/upload', function(Upload $upload) {
    if ($upload->isFinished()) {
        // store following in database, etc.
        $filepath = $upload->mergeAndStore();
        $filename = $upload->getClientOriginalName();

        // This response is up to the user, as long as the response code is 200.
        // This response will be returned from the clients upload() method.
        return response($filepath); 
    }
    // this must be returned to start/resume an upload.
    // Additional elemnts may be added to this json response
    return $upload->uploadResponse();
});

Route::patch('/upload', function(Upload $upload, UploadChunk $chunk) {
    $chunkpath = $upload->storeChunk($chunk);
});
```
### Client
```js
var uploader = new ChunkyUploader(
    '/upload',
    {retry_attempts: 4});

const file = new File(["foo"], "foo.txt", {
  type: "text/plain",
});
uploader.upload(file).then(() => console.log('Upload Finished'));
```
