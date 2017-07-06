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

    // Função que busca os dados referentes a uma dada promoção e a empresa (vendedor) relacionada
    public function findPromo ($params) {
	    // Obtém a promoção pelo ID passado por parâmetro
	    $dado['anuncio'] = (new Promocao())->get($params['id']);
	    // Obtém os dados do vendedor (empresa) referentes à promoção
	    $dado['empresa'] = (new Vendedor())->get($dado['anuncio']->getIdVendedor());

	    // Exibe o json do conjunto promoção/empresa
	    echo jsonSerialize($dado);
    }

    // Função que valida o código digitado pelo usuário, pra ver se confere com o dado do estabelecimento/promoção
    public function validaCodigo ($params) {
        // Obtém a promoção pelo ID passado por parâmetro
        $promocao = (new Promocao())->get($_POST['idPromo']);

        // Compara o código da promoção, em maiúsculas, com o código digitado ($params[0]), também em maiúsculas
        if(strtoupper($promocao->getCodigo()) == strtoupper($_POST['codigo'])){
            // Retorna true caso sejam iguais
            echo jsonSerialize(true);
        } else
            // Retorna false caso não sejam iguais
            echo jsonSerialize(false);
	}
}