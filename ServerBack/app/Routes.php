<?php defined('INITIALIZED') OR exit('You cannot access this file directly');
/*
 * Padrão para a escrita de rotas:
 * $route['URL'] = 'Controller/Method';
 *
 * // Use '?' to indicate that the method needs one or more parameters
 * $route['URL/?'] = 'Controller/Method'; 
 *
 * OBS: As rotas ao fim do arquivo sobrescrevem as do início, portanto rotas com parâmetros devem vir
 * depois de rotas sem parâmetros para funcionar corretamente.
 */

$route['api/countclose/?'] = 'ApiController/countClose';
$route['api/getclose/?'] = 'ApiController/getClose';
$route['api/findpromo/?'] = 'ApiController/findPromo';
$route['api/validacodigo/?'] = 'ApiController/validaCodigo';