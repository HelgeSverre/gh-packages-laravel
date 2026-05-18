laravel evolution-api

https://doc.evolution-api.com/v2/api-reference/

```
class WhatsappHelper {
    
    public $api;
    public $instance;

    public static function instance() {
        return new AppHelper();
    }
    
    public function __construct() {
        $this->instance = 'teste';
        $key = config('evolution.api_key');
        $url = config('evolution.api_url');
        $this->api = new EvolutionApi($url,$key);
    }
    
    /**
     * Inicia whatsapp
     * @return array status
     */
    public function startInstance() 
    {
        //verifica status da instancia
        $evolutionInstanceService = new EvolutionInstanceService($this->api);
        $connectionState = $evolutionInstanceService->getConnectionStatus($this->instance);
        return $connectionState;
     }

    /**
     * Cria whatsapp
     * @return array status
     */
    public function startInstance() 
    {
        $createInstance = $evolutionInstanceService->createInstance(this->instance,true,'WHATSAPP-BAILEYS');
        if (isset($createInstance["qrcode"])) {
            return $createInstance["qrcode"]["base64"];
        }
        return ['connected'];
    }

}
```
