<?php defined('INITIALIZED') OR exit('You cannot access this file directly');

class ApiPromocoesController extends Controller {

    // Funçao que conta o número de promoções próximas
	public function countClose () {
	    // Cria um objeto do tipo GeoLocal, o qual contém as funções básicas para lidar com a geolocalização
        $geo = new GeoLocal();

        // Imprime um json dos resultados obtidos da função de obter os dados próximos (contagem)
        echo jsonSerialize($geo->contaProximos($_POST['latitude'], $_POST['longitude'], $_POST['raio']));
    }


    // Função que obtém as promoções próximas
	public function getClose () {
	    // Cria um objeto do tipo GeoLocal, o qual contém as funções básicas para lidar com a geolocalização
        $geo = new GeoLocal();

        // Imprime um json dos resultados obtidos da função de obter os dados próximos
        echo jsonSerialize($geo->pegaProximos($_POST['latitude'], $_POST['longitude'], $_POST['raio']));
    }


    // Função que obtém a distância do usuário de um dado estabelecimento
	public function getDistanceToSeller () {
	    // Cria um objeto do tipo GeoLocal, o qual contém as funções básicas para lidar com a geolocalização
        $geo = new GeoLocal();

        // Obtém os dados da promoção e do estabelecimento para comparar a distância
        $promo = (new Promocao())->get($_POST['promocao']);
        $estabelecimento = (new Vendedor())->get($promo->getIdVendedor());

        $dist = $geo->calcDistancia(
            $_POST['latitude'],
            $_POST['longitude'],
            $estabelecimento->getLatitude(),
            $estabelecimento->getLongitude()
        );


        // Imprime um json com a distância em metros entre o usuário e o vendedor
        echo jsonSerialize(number_format(
            $dist*1000,
            0,
            ',',
            '.'
        )); // Distância em metros
    }


    // Função que realiza os registros de visualizações de uma promoção
    public function countView () {
	    $cliente = Auth::getLoggedUser();

	    $view = new Visualizacao();
	    $view->setDatahora(date('Y-m-d H:i:s'));
	    $view->setIdPromocao($_POST['idPromo']);
	    $view->setIdCliente($cliente->getId());

	    $view->save();

	    echo jsonSerialize(true);
    }


    // Função que busca os dados referentes a uma dada promoção e a empresa (vendedor) relacionada
    public function findPromo ($params) {
	    // Obtém a promoção pelo ID passado por parâmetro
	    $dado['anuncio'] = (new Promocao())->where('ativo = true AND id = ?', [$params['id']])->find()[0];

	    // Obtém os dados do vendedor (empresa) referentes à promoção
	    $dado['empresa'] = (new Vendedor())->get($dado['anuncio']->getIdVendedor());

	    // Exibe o json do conjunto promoção/empresa
	    echo jsonSerialize($dado);
    }

    // Busca as informações referentes a um dado checkin
    public function findCheckin ($params) {
        $checkin = (new Checkin())->get($params['id']);

        echo jsonSerialize($checkin);
    }


    // Função que valida o código digitado pelo usuário, pra ver se confere com o dado do estabelecimento/promoção
    public function validaCodigo () {
        // Obtém a promoção pelo ID passado por parâmetro
        $promocao = (new Promocao())->get($_POST['idPromo']);

        $cliente = Auth::getLoggedUser();

        // Compara o código da promoção, em maiúsculas, com o código digitado ($params[0]), também em maiúsculas
        if(strtoupper($promocao->getCodigo()) == strtoupper($_POST['codigo'])){

            // Registra o checkin do cliente com esta promocao
            $checkin = new Checkin();
            $checkin->setIdCliente($cliente->getId());
            $checkin->setIdPromocao($promocao->getId());
            $checkin->setDatahora(date('Y-m-d H:i:s'));
            $checkin->save();

            // Retorna o id do checkin caso sejam iguais
            echo jsonSerialize($checkin->getId());
        } else
            // Retorna false caso não sejam iguais
            echo jsonSerialize(false);
	}


	// Função que obtém a posição atual do usuário e vê a distãncia do estabelecimento

}