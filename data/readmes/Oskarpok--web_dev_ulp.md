# web_dev_ulp
  Laravel's universal packages are a collection of related modules with 
  clearly defined contracts (interfaces). They enable integration with other 
  backend services (e.g., Go microservices), delegating processing to them and 
  exposing functionality via APIs (REST/GraphQL). This architecture allows for 
  the use of any frontend framework (Vue, React, etc.)—the choice depends on 
  the project's requirements and complexity.

# to run project
  add env file in docker folder project and its front that you want to 
  run next build containers in docker folder to do it run command 

  podman-compose up --build

  if you have problems with permission use 
  sudo chown -R user:user . 
  or in container use 
  podman exec -it laravel_app bash chown -R www-data:www-data html 
  bentley/storage chmod -R 775 html/bentley/storage
