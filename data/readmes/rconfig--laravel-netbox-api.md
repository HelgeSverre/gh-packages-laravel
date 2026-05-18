## Laravel NetBox for rConfig
NetBox is an open source web application designed to help manage and document computer networks. 

This repository is a Laravel wrapper for the NetBox API forked from wickedsoft/laravel-netbox and pared back for use in rConfig. If has been tested on and updated for PHP 8.1+ and Laravel 10 & 11. 

All endpoints area available per below, but not all are tested. Please log issues if you find any that are not working.

### Table of contents
- [Installation](INSTALL.md)
- [Usage](#usage)
- [Authentication](#authentication)
- [MultiInstalls](#multiinstalls)
- [Change log](CHANGELOG.md)
- [License](LICENSE.md)

### Usage
#### Global
```php
NetBoxApi::status()->show(array $params)
```

#### Circuits
```php
NetBoxApi::circuits()->list(array $params)
NetBoxApi::circuits()->add(array $params)
NetBoxApi::circuits()->remove(int $id, array $params)
NetBoxApi::circuits()->edit(int $id, array $params)
NetBoxApi::circuits()->show(int $id, array $params)
```

```php
NetBoxApi::providers()->list(array $params)
NetBoxApi::providers()->add(array $params)
NetBoxApi::providers()->remove(int $id, array $params)
NetBoxApi::providers()->edit(int $id, array $params)
NetBoxApi::providers()->show(int $id, array $params)
```

```php
NetBoxApi::circuitTerminations()->list(array $params)
NetBoxApi::circuitTerminations()->add(array $params)
NetBoxApi::circuitTerminations()->remove(int $id, array $params)
NetBoxApi::circuitTerminations()->edit(int $id, array $params)
NetBoxApi::circuitTerminations()->show(int $id, array $params)
```

```php
NetBoxApi::circuitTypes()->list(array $params)
NetBoxApi::circuitTypes()->add(array $params)
NetBoxApi::circuitTypes()->remove(int $id, array $params)
NetBoxApi::circuitTypes()->edit(int $id, array $params)
NetBoxApi::circuitTypes()->show(int $id, array $params)
```

#### DCIM
```php
NetBoxApi::cables()->list(array $params)
NetBoxApi::cables()->add(array $params)
NetBoxApi::cables()->remove(int $id, array $params)
NetBoxApi::cables()->edit(int $id, array $params)
NetBoxApi::cables()->show(int $id, array $params)
```

```php
NetBoxApi::connectedDevices()->list(array $params)
```

```php
NetBoxApi::consoleConnections()->list(array $params)
```

```php
NetBoxApi::consolePorts()->list(array $params)
NetBoxApi::consolePorts()->add(array $params)
NetBoxApi::consolePorts()->remove(int $id, array $params)
NetBoxApi::consolePorts()->edit(int $id, array $params)
NetBoxApi::consolePorts()->show(int $id, array $params)
NetBoxApi::consolePorts()->trace(int $id, array $params)
```

```php
NetBoxApi::consolePortTemplates()->list(array $params)
NetBoxApi::consolePortTemplates()->add(array $params)
NetBoxApi::consolePortTemplates()->remove(int $id, array $params)
NetBoxApi::consolePortTemplates()->edit(int $id, array $params)
NetBoxApi::consolePortTemplates()->show(int $id, array $params)
```

```php
NetBoxApi::consoleServerPorts()->list(array $params)
NetBoxApi::consoleServerPorts()->add(array $params)
NetBoxApi::consoleServerPorts()->remove(int $id, array $params)
NetBoxApi::consoleServerPorts()->edit(int $id, array $params)
NetBoxApi::consoleServerPorts()->show(int $id, array $params)
```

```php
NetBoxApi::consoleServerPortTemplates()->list(array $params)
NetBoxApi::consoleServerPortTemplates()->add(array $params)
NetBoxApi::consoleServerPortTemplates()->remove(int $id, array $params)
NetBoxApi::consoleServerPortTemplates()->edit(int $id, array $params)
NetBoxApi::consoleServerPortTemplates()->show(int $id, array $params)
```

```php
NetBoxApi::deviceBays()->list(array $params)
NetBoxApi::deviceBays()->add(array $params)
NetBoxApi::deviceBays()->remove(int $id, array $params)
NetBoxApi::deviceBays()->edit(int $id, array $params)
NetBoxApi::deviceBays()->show(int $id, array $params)
```

```php
NetBoxApi::deviceBayTemplates()->list(array $params)
NetBoxApi::deviceBayTemplates()->add(array $params)
NetBoxApi::deviceBayTemplates()->remove(int $id, array $params)
NetBoxApi::deviceBayTemplates()->edit(int $id, array $params)
NetBoxApi::deviceBayTemplates()->show(int $id, array $params)
```

```php
NetBoxApi::deviceRoles()->list(array $params)
NetBoxApi::deviceRoles()->add(array $params)
NetBoxApi::deviceRoles()->remove(int $id, array $params)
NetBoxApi::deviceRoles()->edit(int $id, array $params)
NetBoxApi::deviceRoles()->show(int $id, array $params)
```

```php
NetBoxApi::devices()->list(array $params)
NetBoxApi::devices()->add(array $params)
NetBoxApi::devices()->remove(int $id, array $params)
NetBoxApi::devices()->edit(int $id, array $params)
NetBoxApi::devices()->show(int $id, array $params)
NetBoxApi::devices()->napalm(int $id, array $params)
```

```php
NetBoxApi::deviceTypes()->list(array $params)
NetBoxApi::deviceTypes()->add(array $params)
NetBoxApi::deviceTypes()->remove(int $id, array $params)
NetBoxApi::deviceTypes()->edit(int $id, array $params)
NetBoxApi::deviceTypes()->show(int $id, array $params)
```

```php
NetBoxApi::frontPorts()->list(array $params)
NetBoxApi::frontPorts()->add(array $params)
NetBoxApi::frontPorts()->remove(int $id, array $params)
NetBoxApi::frontPorts()->edit(int $id, array $params)
NetBoxApi::frontPorts()->show(int $id, array $params)
NetBoxApi::frontPorts()->paths(int $id, array $params)
```

```php
NetBoxApi::frontPortTemplates()->list(array $params)
NetBoxApi::frontPortTemplates()->add(array $params)
NetBoxApi::frontPortTemplates()->remove(int $id, array $params)
NetBoxApi::frontPortTemplates()->edit(int $id, array $params)
NetBoxApi::frontPortTemplates()->show(int $id, array $params)
```

```php
NetBoxApi::interfaceConnections()->list(array $params)
```

```php
NetBoxApi::interfaces()->list(array $params)
NetBoxApi::interfaces()->add(array $params)
NetBoxApi::interfaces()->remove(int $id, array $params)
NetBoxApi::interfaces()->edit(int $id, array $params)
NetBoxApi::interfaces()->show(int $id, array $params)
NetBoxApi::interfaces()->trace(int $id, array $params)
```

```php
NetBoxApi::interfaceTemplates()->list(array $params)
NetBoxApi::interfaceTemplates()->add(array $params)
NetBoxApi::interfaceTemplates()->remove(int $id, array $params)
NetBoxApi::interfaceTemplates()->edit(int $id, array $params)
NetBoxApi::interfaceTemplates()->show(int $id, array $params)
```

```php
NetBoxApi::inventoryItems()->list(array $params)
NetBoxApi::inventoryItems()->add(array $params)
NetBoxApi::inventoryItems()->remove(int $id, array $params)
NetBoxApi::inventoryItems()->edit(int $id, array $params)
NetBoxApi::inventoryItems()->show(int $id, array $params)
```

```php
NetBoxApi::manufacturers()->list(array $params)
NetBoxApi::manufacturers()->add(array $params)
NetBoxApi::manufacturers()->remove(int $id, array $params)
NetBoxApi::manufacturers()->edit(int $id, array $params)
NetBoxApi::manufacturers()->show(int $id, array $params)
```

```php
NetBoxApi::platforms()->list(array $params)
NetBoxApi::platforms()->add(array $params)
NetBoxApi::platforms()->remove(int $id, array $params)
NetBoxApi::platforms()->edit(int $id, array $params)
NetBoxApi::platforms()->show(int $id, array $params)
```

```php
NetBoxApi::powerFeeds()->list(array $params)
NetBoxApi::powerFeeds()->add(array $params)
NetBoxApi::powerFeeds()->remove(int $id, array $params)
NetBoxApi::powerFeeds()->edit(int $id, array $params)
NetBoxApi::powerFeeds()->show(int $id, array $params)
NetBoxApi::powerFeeds()->trace(int $id, array $params)
```

```php
NetBoxApi::powerOutlets()->list(array $params)
NetBoxApi::powerOutlets()->add(array $params)
NetBoxApi::powerOutlets()->remove(int $id, array $params)
NetBoxApi::powerOutlets()->edit(int $id, array $params)
NetBoxApi::powerOutlets()->show(int $id, array $params)
NetBoxApi::powerOutlets()->trace(int $id, array $params)
```

```php
NetBoxApi::powerOutletTemplates()->list(array $params)
NetBoxApi::powerOutletTemplates()->add(array $params)
NetBoxApi::powerOutletTemplates()->remove(int $id, array $params)
NetBoxApi::powerOutletTemplates()->edit(int $id, array $params)
NetBoxApi::powerOutletTemplates()->show(int $id, array $params)
```

```php
NetBoxApi::powerPanels()->list(array $params)
NetBoxApi::powerPanels()->add(array $params)
NetBoxApi::powerPanels()->remove(int $id, array $params)
NetBoxApi::powerPanels()->edit(int $id, array $params)
NetBoxApi::powerPanels()->show(int $id, array $params)
```

```php
NetBoxApi::powerPorts()->list(array $params)
NetBoxApi::powerPorts()->add(array $params)
NetBoxApi::powerPorts()->remove(int $id, array $params)
NetBoxApi::powerPorts()->edit(int $id, array $params)
NetBoxApi::powerPorts()->show(int $id, array $params)
NetBoxApi::powerPorts()->trace(int $id, array $params)
```

```php
NetBoxApi::powerPortTemplates()->list(array $params)
NetBoxApi::powerPortTemplates()->add(array $params)
NetBoxApi::powerPortTemplates()->remove(int $id, array $params)
NetBoxApi::powerPortTemplates()->edit(int $id, array $params)
NetBoxApi::powerPortTemplates()->show(int $id, array $params)
```

```php
NetBoxApi::rackGroups()->list(array $params)
NetBoxApi::rackGroups()->add(array $params)
NetBoxApi::rackGroups()->remove(int $id, array $params)
NetBoxApi::rackGroups()->edit(int $id, array $params)
NetBoxApi::rackGroups()->show(int $id, array $params)
```

```php
NetBoxApi::rackReservations()->list(array $params)
NetBoxApi::rackReservations()->add(array $params)
NetBoxApi::rackReservations()->remove(int $id, array $params)
NetBoxApi::rackReservations()->edit(int $id, array $params)
NetBoxApi::rackReservations()->show(int $id, array $params)
```

```php
NetBoxApi::rackRoles()->list(array $params)
NetBoxApi::rackRoles()->add(array $params)
NetBoxApi::rackRoles()->remove(int $id, array $params)
NetBoxApi::rackRoles()->edit(int $id, array $params)
NetBoxApi::rackRoles()->show(int $id, array $params)
```

```php
NetBoxApi::racks()->list(array $params)
NetBoxApi::racks()->add(array $params)
NetBoxApi::racks()->remove(int $id, array $params)
NetBoxApi::racks()->edit(int $id, array $params)
NetBoxApi::racks()->show(int $id, array $params)
NetBoxApi::racks()->elevation(int $id, array $params)
```

```php
NetBoxApi::rearPorts()->list(array $params)
NetBoxApi::rearPorts()->add(array $params)
NetBoxApi::rearPorts()->remove(int $id, array $params)
NetBoxApi::rearPorts()->edit(int $id, array $params)
NetBoxApi::rearPorts()->show(int $id, array $params)
NetBoxApi::rearPorts()->paths(int $id, array $params)
```

```php
NetBoxApi::rearPortTemplates()->list(array $params)
NetBoxApi::rearPortTemplates()->add(array $params)
NetBoxApi::rearPortTemplates()->remove(int $id, array $params)
NetBoxApi::rearPortTemplates()->edit(int $id, array $params)
NetBoxApi::rearPortTemplates()->show(int $id, array $params)
```

```php
NetBoxApi::regions()->list(array $params)
NetBoxApi::regions()->add(array $params)
NetBoxApi::regions()->remove(int $id, array $params)
NetBoxApi::regions()->edit(int $id, array $params)
NetBoxApi::regions()->show(int $id, array $params)
```

```php
NetBoxApi::sites()->list(array $params)
NetBoxApi::sites()->add(array $params)
NetBoxApi::sites()->remove(int $id, array $params)
NetBoxApi::sites()->edit(int $id, array $params)
NetBoxApi::sites()->show(int $id, array $params)
```

```php
NetBoxApi::virtualChassis()->list(array $params)
NetBoxApi::virtualChassis()->add(array $params)
NetBoxApi::virtualChassis()->remove(int $id, array $params)
NetBoxApi::virtualChassis()->edit(int $id, array $params)
NetBoxApi::virtualChassis()->show(int $id, array $params)
```

#### Extras
```php
NetBoxApi::configContexts()->list(array $params)
NetBoxApi::configContexts()->add(array $params)
NetBoxApi::configContexts()->remove(int $id, array $params)
NetBoxApi::configContexts()->edit(int $id, array $params)
NetBoxApi::configContexts()->show(int $id, array $params)
```

```php
NetBoxApi::contentTypes()->list(array $params)
NetBoxApi::contentTypes()->show(int $id, array $params)
```

```php
NetBoxApi::customFields()->list(array $params)
NetBoxApi::customFields()->add(array $params)
NetBoxApi::customFields()->remove(int $id, array $params)
NetBoxApi::customFields()->edit(int $id, array $params)
NetBoxApi::customFields()->show(int $id, array $params)
```

```php
NetBoxApi::exportTemplates()->list(array $params)
NetBoxApi::exportTemplates()->add(array $params)
NetBoxApi::exportTemplates()->remove(int $id, array $params)
NetBoxApi::exportTemplates()->edit(int $id, array $params)
NetBoxApi::exportTemplates()->show(int $id, array $params)
```

```php
NetBoxApi::imageAttachments()->list(array $params)
NetBoxApi::imageAttachments()->add(array $params)
NetBoxApi::imageAttachments()->remove(int $id, array $params)
NetBoxApi::imageAttachments()->edit(int $id, array $params)
NetBoxApi::imageAttachments()->show(int $id, array $params)
```

```php
NetBoxApi::jobResults()->list(array $params)
NetBoxApi::jobResults()->show(int $id, array $params)
```

```php
NetBoxApi::objectChanges()->list(array $params)
NetBoxApi::objectChanges()->show(int $id, array $params)
```

```php
NetBoxApi::reports()->list(array $params)
NetBoxApi::reports()->show(int $id, array $params)
NetBoxApi::reports()->run(int $id, array $params)
```

```php
NetBoxApi::scripts()->list(array $params)
NetBoxApi::scripts()->show(int $id, array $params)
```

```php
NetBoxApi::tags()->list(array $params)
NetBoxApi::tags()->add(array $params)
NetBoxApi::tags()->remove(int $id, array $params)
NetBoxApi::tags()->edit(int $id, array $params)
NetBoxApi::tags()->show(int $id, array $params)
```

#### IPAM
```php
NetBoxApi::aggregates()->list(array $params)
NetBoxApi::aggregates()->add(array $params)
NetBoxApi::aggregates()->remove(int $id, array $params)
NetBoxApi::aggregates()->edit(int $id, array $params)
NetBoxApi::aggregates()->show(int $id, array $params)
```

```php
NetBoxApi::ipAddresses()->list(array $params)
NetBoxApi::ipAddresses()->add(array $params)
NetBoxApi::ipAddresses()->remove(int $id, array $params)
NetBoxApi::ipAddresses()->edit(int $id, array $params)
NetBoxApi::ipAddresses()->show(int $id, array $params)
```

```php
NetBoxApi::prefixes()->list(array $params)
NetBoxApi::prefixes()->add(array $params)
NetBoxApi::prefixes()->remove(int $id, array $params)
NetBoxApi::prefixes()->edit(int $id, array $params)
NetBoxApi::prefixes()->show(int $id, array $params)
NetBoxApi::prefixes()->addAvailableIps(int $id, array $params)
NetBoxApi::prefixes()->showAvailableIps(int $id, array $params)
NetBoxApi::prefixes()->addAvailable(int $id, array $params)
NetBoxApi::prefixes()->showAvailable(int $id, array $params)
```

```php
NetBoxApi::rirs()->list(array $params)
NetBoxApi::rirs()->add(array $params)
NetBoxApi::rirs()->remove(int $id, array $params)
NetBoxApi::rirs()->edit(int $id, array $params)
NetBoxApi::rirs()->show(int $id, array $params)
```

```php
NetBoxApi::roles()->list(array $params)
NetBoxApi::roles()->add(array $params)
NetBoxApi::roles()->remove(int $id, array $params)
NetBoxApi::roles()->edit(int $id, array $params)
NetBoxApi::roles()->show(int $id, array $params)
```

```php
NetBoxApi::routeTargets()->list(array $params)
NetBoxApi::routeTargets()->add(array $params)
NetBoxApi::routeTargets()->remove(int $id, array $params)
NetBoxApi::routeTargets()->edit(int $id, array $params)
NetBoxApi::routeTargets()->show(int $id, array $params)
```

```php
NetBoxApi::services()->list(array $params)
NetBoxApi::services()->add(array $params)
NetBoxApi::services()->remove(int $id, array $params)
NetBoxApi::services()->edit(int $id, array $params)
NetBoxApi::services()->show(int $id, array $params)
```

```php
NetBoxApi::vlanGroups()->list(array $params)
NetBoxApi::vlanGroups()->add(array $params)
NetBoxApi::vlanGroups()->remove(int $id, array $params)
NetBoxApi::vlanGroups()->edit(int $id, array $params)
NetBoxApi::vlanGroups()->show(int $id, array $params)
```

```php
NetBoxApi::vlans()->list(array $params)
NetBoxApi::vlans()->add(array $params)
NetBoxApi::vlans()->remove(int $id, array $params)
NetBoxApi::vlans()->edit(int $id, array $params)
NetBoxApi::vlans()->show(int $id, array $params)
```

```php
NetBoxApi::vrfs()->list(array $params)
NetBoxApi::vrfs()->add(array $params)
NetBoxApi::vrfs()->remove(int $id, array $params)
NetBoxApi::vrfs()->edit(int $id, array $params)
NetBoxApi::vrfs()->show(int $id, array $params)
```

#### Secrets
```php
NetBoxApi::keyGen()->list(array $params)
```

```php
NetBoxApi::secrets()->list(array $params)
NetBoxApi::secrets()->add(array $params)
NetBoxApi::secrets()->remove(int $id, array $params)
NetBoxApi::secrets()->edit(int $id, array $params)
NetBoxApi::secrets()->show(int $id, array $params)
```

```php
NetBoxApi::secretRoles()->list(array $params)
NetBoxApi::secretRoles()->add(array $params)
NetBoxApi::secretRoles()->remove(int $id, array $params)
NetBoxApi::secretRoles()->edit(int $id, array $params)
NetBoxApi::secretRoles()->show(int $id, array $params)
```

```php
NetBoxApi::session()->list(array $params)
```

#### Tenancy
```php
NetBoxApi::tenantGroups()->list(array $params)
NetBoxApi::tenantGroups()->add(array $params)
NetBoxApi::tenantGroups()->remove(int $id, array $params)
NetBoxApi::tenantGroups()->edit(int $id, array $params)
NetBoxApi::tenantGroups()->show(int $id, array $params)
```

```php
NetBoxApi::tenants()->list(array $params)
NetBoxApi::tenants()->add(array $params)
NetBoxApi::tenants()->remove(int $id, array $params)
NetBoxApi::tenants()->edit(int $id, array $params)
NetBoxApi::tenants()->show(int $id, array $params)
```

#### Users
```php
NetBoxApi::config()->list(array $params)
```

```php
NetBoxApi::groups()->list(array $params)
NetBoxApi::groups()->add(array $params)
NetBoxApi::groups()->remove(int $id, array $params)
NetBoxApi::groups()->edit(int $id, array $params)
NetBoxApi::groups()->show(int $id, array $params)
```

```php
NetBoxApi::permissions()->list(array $params)
NetBoxApi::permissions()->add(array $params)
NetBoxApi::permissions()->remove(int $id, array $params)
NetBoxApi::permissions()->edit(int $id, array $params)
NetBoxApi::permissions()->show(int $id, array $params)
```

```php
NetBoxApi::users()->list(array $params)
NetBoxApi::users()->add(array $params)
NetBoxApi::users()->remove(int $id, array $params)
NetBoxApi::users()->edit(int $id, array $params)
NetBoxApi::users()->show(int $id, array $params)
```

#### Virtualization
```php
NetBoxApi::clusterGroups()->list(array $params)
NetBoxApi::clusterGroups()->add(array $params)
NetBoxApi::clusterGroups()->remove(int $id, array $params)
NetBoxApi::clusterGroups()->edit(int $id, array $params)
NetBoxApi::clusterGroups()->show(int $id, array $params)
```

```php
NetBoxApi::clusters()->list(array $params)
NetBoxApi::clusters()->add(array $params)
NetBoxApi::clusters()->remove(int $id, array $params)
NetBoxApi::clusters()->edit(int $id, array $params)
NetBoxApi::clusters()->show(int $id, array $params)
```

```php
NetBoxApi::clusterTypes()->list(array $params)
NetBoxApi::clusterTypes()->add(array $params)
NetBoxApi::clusterTypes()->remove(int $id, array $params)
NetBoxApi::clusterTypes()->edit(int $id, array $params)
NetBoxApi::clusterTypes()->show(int $id, array $params)
```

```php
NetBoxApi::vinterfaces()->list(array $params)
NetBoxApi::vinterfaces()->add(array $params)
NetBoxApi::vinterfaces()->remove(int $id, array $params)
NetBoxApi::vinterfaces()->edit(int $id, array $params)
NetBoxApi::vinterfaces()->show(int $id, array $params)
```

```php
NetBoxApi::virtualMachines()->list(array $params)
NetBoxApi::virtualMachines()->add(array $params)
NetBoxApi::virtualMachines()->remove(int $id, array $params)
NetBoxApi::virtualMachines()->edit(int $id, array $params)
NetBoxApi::virtualMachines()->show(int $id, array $params)
```
 
 
### MultiInstalls
#### Configuration
If you want to work with more Netbox installs, you can define more instances in the `config/netbox.php` file
```php
// config/netbox.php
'sites' => [

    'default' => [
        'url' => env('NETBOX_DEFAULT_URL'),
        'key' => env('NETBOX_DEFAULT_KEY'),
    ],

    'chicago' => [
        'url' => env('NETBOX_CHI_URL'),
        'key' => env('NETBOX_CHI_KEY'),
    ],

],
```
#### Default site
If you have multiple Netbox sites, you can add this to your environment file (.env), in order to pick a different default site than the default.
```
NETBOX_CONNECTION=
```

#### Access
To use another netbox than your default one, you can specify it with the site method
```php
// UsersController
public function getIndex()
{
    $users = NetBoxApi::site('chicago')->users()->list([
        'limit' => 20
    ]);

    //
}
```

#### Filtering endpoints

If you want to filter the endpoints, you can do so by reviewing the filter docs for netbox here [https://demo.netbox.dev/static/docs/rest-api/filtering/](https://demo.netbox.dev/static/docs/rest-api/filtering/)
and apply filters to thhe endpoint such as below.

```php
$params = [
    'tag' => 'excluded',
];


$response2 = NetBoxApi::devices()->list($params);
dd($response2);
```