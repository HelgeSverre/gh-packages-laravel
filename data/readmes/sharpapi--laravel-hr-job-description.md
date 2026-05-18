![SharpAPI GitHub cover](https://sharpapi.com/sharpapi-github-laravel-bg.jpg "SharpAPI Laravel Client")

# AI Job Description Generator for Laravel

## 🚀 Leverage AI API to streamline job description creation in your HR Tech applications.

[![Latest Version on Packagist](https://img.shields.io/packagist/v/sharpapi/laravel-hr-job-description.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-hr-job-description)
[![Total Downloads](https://img.shields.io/packagist/dt/sharpapi/laravel-hr-job-description.svg?style=flat-square)](https://packagist.org/packages/sharpapi/laravel-hr-job-description)

Check the details at SharpAPI's [Job Description Generator API](https://sharpapi.com/en/catalog/ai/hr-tech) page.

---

## Requirements

- PHP >= 8.1
- Laravel >= 10.48.29

---

## Installation

Follow these steps to install and set up the SharpAPI Laravel Job Description Generator package.

1. Install the package via `composer`:

```bash
composer require sharpapi/laravel-hr-job-description
```

2. Register at [SharpAPI.com](https://sharpapi.com/) to obtain your API key.

3. Set the API key in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
```

4. **[OPTIONAL]** Publish the configuration file:

```bash
php artisan vendor:publish --tag=sharpapi-hr-job-description
```

---
## Key Features

- **AI-Powered Job Description Generation**: Efficiently create comprehensive job descriptions with customizable parameters.
- **Customizable Output**: Control various aspects of the job description including required skills, experience, education, and more.
- **Voice Tone Control**: Set your preferred writing style for the job description.
- **Robust Polling for Results**: Polling-based API response handling with customizable intervals.
- **API Availability and Quota Check**: Check API availability and current usage quotas with SharpAPI's endpoints.

---

## Usage

You can inject the `HrJobDescriptionService` class to access job description generation functionality. For best results, especially with batch processing, use Laravel's queuing system to optimize job dispatch and result polling.

### Basic Workflow

1. **Create Parameters**: Create a JobDescriptionParameters object with your job details.
2. **Dispatch Job**: Send the parameters to the API using `generateJobDescription`, which returns a status URL.
3. **Poll for Results**: Use `fetchResults($statusUrl)` to poll until the job completes or fails.
4. **Process Result**: After completion, retrieve the results from the `SharpApiJob` object returned.

> **Note**: Each job typically takes a few seconds to complete. Once completed successfully, the status will update to `success`, and you can process the results as JSON, array, or object format.

---

### Controller Example

Here is an example of how to use `HrJobDescriptionService` within a Laravel controller:

```php
<?php

namespace App\Http\Controllers;

use GuzzleHttp\Exception\GuzzleException;
use SharpAPI\HrJobDescription\HrJobDescriptionService;
use SharpAPI\HrJobDescription\Dto\JobDescriptionParameters;

class JobController extends Controller
{
    protected HrJobDescriptionService $jobDescriptionService;

    public function __construct(HrJobDescriptionService $jobDescriptionService)
    {
        $this->jobDescriptionService = $jobDescriptionService;
    }

    /**
     * @throws GuzzleException
     */
    public function generateJobDescription()
    {
        $jobDescriptionParameters = new JobDescriptionParameters(
            name: "PHP Senior Engineer",
            company_name: "ACME LTD",   // optional
            minimum_work_experience: "5 years",   // optional
            minimum_education: "Bachelor Degree",   // optional
            employment_type: "full time",   // optional
            required_skills: ['PHP8', 'Laravel'],   // optional
            optional_skills: ['AWS', 'Redis'],   // optional
            country: "United Kingdom",   // optional
            remote: true,   // optional
            visa_sponsored: true,   // optional
            voice_tone: 'Professional and Geeky',   // optional voice tone
            context: null,   // optional context, additional AI processing instructions
            language: null   // optional output language
        );
        
        $statusUrl = $this->jobDescriptionService->generateJobDescription($jobDescriptionParameters);
        $result = $this->jobDescriptionService->fetchResults($statusUrl);

        return response()->json($result->getResultJson());
    }
}
```

### Handling Guzzle Exceptions

All requests are managed by Guzzle, so it's helpful to be familiar with [Guzzle Exceptions](https://docs.guzzlephp.org/en/stable/quickstart.html#exceptions).

Example:

```php
use GuzzleHttp\Exception\ClientException;

try {
    $statusUrl = $this->jobDescriptionService->generateJobDescription($jobDescriptionParameters);
} catch (ClientException $e) {
    echo $e->getMessage();
}
```

---

## Optional Configuration

You can customize the configuration by setting the following environment variables in your `.env` file:

```bash
SHARP_API_KEY=your_api_key_here
SHARP_API_JOB_STATUS_POLLING_WAIT=180
SHARP_API_JOB_STATUS_USE_POLLING_INTERVAL=true
SHARP_API_JOB_STATUS_POLLING_INTERVAL=10
SHARP_API_BASE_URL=https://sharpapi.com/api/v1
```

---

## Job Description Data Format Example

```json
{
  "data": {
    "type": "api_job_result",
    "id": "081d6ba5-329d-4723-b88f-a8c88bc3a9cb",
    "attributes": {
      "status": "success",
      "type": "hr_job_description",
      "result": {
        "job_requirements": "- Minimum of 5 years of experience in software engineering\n- Bachelor's Degree in Computer Science or related field\n- Proficiency in PHP8, Laravel, and MySQL\n- Familiarity with AWS RDS, AWS Aurora, and GitFlow is a plus\n- Strong problem-solving skills and attention to detail\n- Excellent communication and teamwork abilities\n- C-class driving license",
        "job_responsibilities": "- Develop, test, and maintain high-quality PHP applications\n- Collaborate with cross-functional teams to define and implement new features\n- Optimize application performance and scalability\n- Ensure code quality and maintainability through code reviews and best practices\n- Troubleshoot and resolve software defects and issues\n- Stay updated with the latest industry trends and technologies\n- Mentor and guide junior developers",
        "job_short_description": "We are seeking a highly skilled Senior PHP Software Engineer to join our remote team in the United Kingdom. This full-time position requires a minimum of 5 years of experience and a Bachelor's Degree. The ideal candidate will have expertise in PHP8, Laravel, and MySQL, with additional skills in AWS RDS, AWS Aurora, and GitFlow being advantageous. Visa sponsorship is available."
      }
    }
  }
}
```

---

## Support & Feedback

For issues or suggestions, please:

- [Open an issue on GitHub](https://github.com/sharpapi/laravel-hr-job-description/issues)
- Join our [Telegram community](https://t.me/sharpapi_community)

---

## Changelog

Please see [CHANGELOG](CHANGELOG.md) for a detailed list of changes.

---

## Credits

- [A2Z WEB LTD](https://github.com/a2zwebltd)
- [Dawid Makowski](https://github.com/makowskid)
- Enhance your [Laravel AI](https://sharpapi.com/) capabilities!

---

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

---

## Follow Us

Stay updated with news, tutorials, and case studies:

- [SharpAPI on X (Twitter)](https://x.com/SharpAPI)
- [SharpAPI on YouTube](https://www.youtube.com/@SharpAPI)
- [SharpAPI on Vimeo](https://vimeo.com/SharpAPI)
- [SharpAPI on LinkedIn](https://www.linkedin.com/products/a2z-web-ltd-sharpapicom-automate-with-aipowered-api/)
- [SharpAPI on Facebook](https://www.facebook.com/profile.php?id=61554115896974)