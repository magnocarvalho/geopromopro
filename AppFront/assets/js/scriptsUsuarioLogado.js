/*
* @author Vinicius Baroni Soares
*/
var raio = 1.5;
var distObter = 50;

urlRaiz = 'http://localhost/geopromo/ServerBack';
linkCadeu = 'http://cadeu.tk';


// Verifica se o usuário atual está autenticado no sistema
function getAuth(secundaryFunction) {
    $.ajax({
        url: urlRaiz+'/api/getauth',
        dataType: 'json',
        success: function (data) {
            processLoginInfo(data, secundaryFunction);
        },
        error: function (data) {
            alert("Houve um problema");
        }
    });
}

// Executa a dada função caso esteja logado ou redireciona para a index (login)
function processLoginInfo (isLogged, secundaryFunction) {
    if(isLogged){
        secundaryFunction();
    } else {
        location.href='index.html';
    }
}




/**
* Captura os dados de latitude e longitude do usuário e realiza a requisição ao servidor para obter
* os dados de acordo com a função base. 
* Pode retornar o número de anúncios próximos ou os dados referentes a eles.
*/
function getDados(funcaoSecundaria, funcao, noMessage){
    (funcao !== null)? funcao:'get';
    (noMessage !== null)? noMessage:false;

	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(function(position){
			// Função em caso de sucesso ao obter a posição do usuário
			var lat = position.coords.latitude;
			var long = position.coords.longitude;
			var url = urlRaiz + '/api/';
			if(funcao == 'get')
				url += 'getclose';
			else if(funcao == 'count')
				url += 'countclose';

			$.ajax({
				url: url,
				dataType: 'json',
                method: 'post',
                data: {'raio': raio, 'latitude': lat, 'longitude':long},
				success: function(data){
					if(data == ''){
						if(noMessage == false){
							//alert('Não há nenhuma promoção próxima a você.');
						}
					}
					funcaoSecundaria(data);
				},
				error: function(data, noMessage){
					if(noMessage == false){
						alert('Houve um problema');
						console.log(data);
					}
				}
			});
		}, function(error, noMessage){
			// Função em caso de falha na obtenção dos dados geográficos
			if(noMessage == false){
				alert('Não foi possível obter sua localização. (Erro ' + error.code + ')');
			}
		})
	}
	else{
		// Execução em caso de o navegador cliente não oferecer suporte
		alert('Você deve usar um navegador compatível com geolocalização e compartilhar seu local para usar o sistema.');
	}
}


/**
* Função que obtém a contagem do número de anúncios próximos ao visitante
*/
function contaPromos(mostraLoad){
    (mostraLoad !== null)? mostraLoad:true;

	if(mostraLoad){
		if($('.loading-image').length == 0){
			$('body').append('<span class="loading-image load-bottom"></span>');
		}
	}

	getDados(function(tamanho){
		$('.loading-image').remove();
		$('#cont').removeAttr('style');


		if(tamanho > 0){
			$('#cont #contador').html(tamanho);
			if(tamanho == 1){
				$('#cont p:first').html('Há 1 promoção próxima!');
			} else{
				$('#cont p:first').html('Há '+tamanho+' promoções próximas!');
			}
			$('#cont p.mini').html('Toque para visualizar');
		} else{
			$('#cont p.mini').html('');
			$('#cont #contador').html('0');
			$('#cont p:first').html('Não há nenhuma promoção próxima a você.');
		}

		$('.container').attr('onclick', "location.href='lista.html'");

		/*
		* Teste de rolagem da página com mais blocos na inicial. Fazer dela um hub de funções.
		*/

		// $('body').append('<div style="clear:both"><div class="bloco teste"></div>');
		// $('body').append('<div style="clear:both"><div class="bloco teste"></div>');
		// $('body').append('<div style="clear:both"><div class="bloco teste"></div>');
		// $('.teste').append('<br><br><br><br><br>');

	}, 'count');
}

/**
* Função que obtém os dados básicos de todas os anúncios próximos ao visitante
*/
function getPromos(mostraLoad){
    (mostraLoad !== null)? mostraLoad:true;

	if(mostraLoad){
		if($('.loading-image').length == 0){
			$('body').append('<span class="loading-image load-bottom"></span>');
		}
	}
	// Remove os resultados
	$('.lista').remove();
	$('#no-result').remove();

	// Desabilita o botão de atualizar durante a atualização
	$('.btn-update').attr('disabled', 'true');
	$('.btn-update').addClass('btn-disabled');

	getDados(function(dados){
		$('.loading-image').remove();

		if(dados == ''){
			$('.container').append(
				'<span id="no-result" class="textcontent">Não há nenhuma promoção próxima a você.</span>'
			);
		} else{$(dados['promo']).each(function(dado){
				$('.container').append('<div class="lista clickable" onclick="location.href=\'promo.html?' +
					dados['promo'][dado]['id'] + '&'+ dados['promo'][dado]['dist'] + '\'"><h2 class="tituloPromo">' +
					dados['promo'][dado]['titulo'] + ' </h2><p class="gray nomeEmpresa">' +
					dados['promo'][dado]['empresa'] + '</p><span class="dist-block"><b>Distância: </b>' +
					dados['promo'][dado]['dist'] + ' m<br></span></div>');
			});
		}
		// Reativa o botão de atualizar
		$('.btn-update').removeAttr('style');
		$('.btn-update').removeAttr('disabled');
		$('.btn-update').removeClass('btn-disabled');
	}, 'get');
}

/**
* Função que obtém o ID de um anúncio específico e faz a requisição ao servidor para
* obter todos os dados essenciais.
*/
function buscaPromo(idPromo, funcaoSecundaria, dadosExtras){
	var url = urlRaiz + '/api/findpromo/' + idPromo;

	$.ajax({
		url: url,
		dataType: 'json',
		success: function(dado){
			$('.loading-image').remove();
			funcaoSecundaria(dado, dadosExtras);
		},
		error: function(dado){
			console.log(dado);
			alert('Não foi possível obter os dados do anúncio.');
		}
	});
}

/**
* Função que chama a função de obtenção de dados para exibi-los na página.
*/
function exibePromo(idPromo, mostraLoad){
    (mostraLoad !== null)? mostraLoad:true;

	if(mostraLoad){
		if($('.loading-image').length == 0){
			$('body').append('<span class="loading-image load-bottom"></span>');
		}
	}

	buscaPromo(idPromo, function(dado){

        var url = urlRaiz + '/api/countview';

        // Realiza requisição para registrar a visualização da promoção no BD
        $.ajax({
            url: url,
            dataType: 'json',
            method: 'post',
            data: {'idPromo': dado.anuncio.id},
            success: function (data) {
                var descricao
                if(dado.anuncio.descricao == null)
                    descricao = '<i class="gray">[Nenhuma descrição]</i>';
                else
                    descricao = dado.anuncio.descricao;

                var porcdesconto;
                if(dado.anuncio.desconto != null){
                    var valorDesconto = dado.anuncio.desconto;
                    var color;

                    /*
                     * Mostra o desconto em uma cor específica dependendo do valor de desconto.
                     * Passa, de forma crescente, por azul claro, azul escuro, laranja e vermelho.
                     */
                    if (valorDesconto < 25)
                        color = 'colorlightblue';
                    else if (valorDesconto < 50)
                        color = 'colordarkblue';
                    else if (valorDesconto < 75)
                        color = 'colororange';
                    else
                        color = 'colorred';

                    porcdesconto = '<span class="desconto ' + color + '"><span class="porcentagem">' + valorDesconto +
                        '%</span><br> de desconto</span><br>';
                } else
                    porcdesconto = '';

                /**
                 * Define todo o texto a se inserido na página
                 */
                var conteudo = '<h2 class="tituloPromo">' + dado.anuncio.titulo + ' </h2>';
                conteudo += '<span class="descanuncio">'+ descricao +'</span><br>';
                conteudo += porcdesconto;
                if(dado.anuncio.valorDe != null && dado.anuncio.valorPor != null){
                    conteudo += '<span class="valores"><div class="meio">De R$<span class="valor valorDe">' +
                        moneyFormat(dado.anuncio.valorDe) + '</span></div>';
                    conteudo += '<div class="meio">Por R$<span class="valor valorPor">' + moneyFormat(dado.anuncio.valorPor) +
                        '</span></div></span>';
                }
                conteudo += '<span class="dist-block full divisor"><b class="mini">Distância (última atualização): </b>' +
                    distanciaCalculada + ' m<br></span>'
                if(distanciaCalculada <= distObter)
                    conteudo += '<span class="btn btn-square" onclick="location.href=\'obterpromocao.html?' + idPromo +
                        '\'">Eu quero!</span>';
                else
                    conteudo += '<p class="mini gray">Aproxime-se do estabelecimento para resgatar a promoção</p><br>';

                $('.container').append(conteudo);
                $('.headertext .texto').append(dado.empresa.razaosocial);

                if(dado.empresa.foto_fachada != null)
                    $('<div id="imageheader" style="background-image: url(\'' + urlRaiz + '/assets/images/uploads/' +
                        dado.empresa.foto_fachada + '\')"></div>"').insertBefore($('#header'));
            },
            error: function (data) {
                console.log(data);
            }
        });
	});
}

/**
* Função que chama a de obter os dados do anúncio e exibe-os na página de obter promoção.
*/
function exibeObterPromo($idPromo){
	buscaPromo(idPromo, function(dado){
		$('#nomeEmpresa').append(dado.empresa.estabelecimento);
		$('<input type="hidden" id="idPromo" value="' + idPromo + '">').insertBefore($('.btn.btn-square'));
	});
}

/**
* Função que faz a requisição ao servidor e verifica o resultado para definir
* se o código digitado está correto.
*/
function validaCodigo(){

    var idPromo = $('#idPromo').val();
    var codigoDigitado = $('#codigo').val();

    // Busca a localização atual do usuário para saber a distância entre ele e o vendedor
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            // Função em caso de sucesso ao obter a posição do usuário
            var lat = position.coords.latitude;
            var long = position.coords.longitude;
            var url = urlRaiz + '/api/getdistance';

            $.ajax({
                url: url,
                dataType: 'json',
                method: 'post',
                data: {'latitude': lat, 'longitude':long, 'promocao':idPromo},
                success: function(data) {
                    $('.alert').remove();


                    if (codigoDigitado == '') {
                        $('.alert-erro').remove();
                        $('<span class="alert alert-erro">Insira o código da empresa.</span>').insertAfter('#codigo');

                    } else if(data > distObter) { // Caso a distância entre o usuário e o vendedor seja maior a 50m
                        $('.alert-erro').remove();
                        $('<span class="alert alert-erro">Você está muito da empresa para solicitar esta promoção.' +
                            '</span>').insertAfter('#codigo');
                    }else{
                        $.ajax({
                            url: urlRaiz + '/api/validacodigo',
                            dataType: 'json',
                            method: 'post',
                            data: {'idPromo':idPromo, 'codigo':codigoDigitado},
                            success: function(dados){
                                if(dados == false)
                                    $('<span class="alert alert-erro">O código digitado é inválido.</span>').insertAfter('#codigo');
                                else
                                    location.href='promocaoresgatada.html?' + idPromo + '&' + dados;
                            },
                            error: function(dados){
                                console.log(dados);
                                alert('Não foi possível realizar a validação do código.');
                            }
                        });
                    }
                },
                error: function(data, noMessage){
                    if(noMessage == false){
                        alert('Houve um problema');
                        console.log(data);
                    }
                }
            });
        }, function(error, noMessage){
            // Função em caso de falha na obtenção dos dados geográficos
            if(noMessage == false){
                alert('Não foi possível obter sua localização. (Erro ' + error.code + ')');
            }
        })
    }
    else{
        // Execução em caso de o navegador cliente não oferecer suporte
        alert('Você deve usar um navegador compatível com geolocalização e compartilhar seu local para usar o sistema.');
    }
}

/**
* Função que chama a de obter os dados do anúncio e exibe-os na página de promoção obtida.
*/
function exibePromoObtida(idPromo, idCheckin){
	buscaPromo(idPromo, function(dado){
        var url = urlRaiz + '/api/findcheckin/' + idCheckin;

        // Formata os dados de valores da promoção, como porcentagem de desconto e valores promocionais
        var porcdesconto;
        if(dado.anuncio.desconto != null){
            var valorDesconto = dado.anuncio.desconto;
            var color;

            /*
             * Mostra o desconto em uma cor específica dependendo do valor de desconto.
             * Passa, de forma crescente, por azul claro, azul escuro, laranja e vermelho.
             */
            if (valorDesconto < 25)
                color = 'colorlightblue';
            else if (valorDesconto < 50)
                color = 'colordarkblue';
            else if (valorDesconto < 75)
                color = 'colororange';
            else
                color = 'colorred';

            porcdesconto = '<span class="desconto ' + color + '"><span class="porcentagem">' + valorDesconto +
                '%</span><br> de desconto</span><br>';
        } else
            porcdesconto = '';

        // Define os conteúdos referentes aos valores a serem inseridos na página
        var conteudo = porcdesconto;
        if(dado.anuncio.valorDe != null && dado.anuncio.valorPor != null){
            conteudo += '<span class="valores"><div class="meio">De R$<span class="valor valorDe">' +
                moneyFormat(dado.anuncio.valorDe) + '</span></div>';
            conteudo += '<div class="meio">Por R$<span class="valor valorPor">' + moneyFormat(dado.anuncio.valorPor) +
                '</span></div></span>';
        }


        if(dado.empresa.foto_fachada != null)
            $('<div id="imageheader" style="background-image: url(\'' + urlRaiz + '/assets/images/uploads/' +
                dado.empresa.foto_fachada + '\')"></div>"').insertBefore($('#header'));



        // Consulta o banco para pegar os dados do checkin e insere a data/hora na página
        $.ajax({
            url: url,
            dataType: 'json',
            success: function(dado){
                var datahora = dado.Checkin.datahora;

                var arrDataHora = breakDateTime(datahora);
                $('#dataResgate').append(arrDataHora['dia'] + '/' +
                    arrDataHora['mes'] + '/' + arrDataHora['ano'] + ', às ' + arrDataHora['hora'] + ':' +
                    arrDataHora['minuto']);
            },
            error: function(dado){
                console.log(dado);
            }
        });

        // Insere os demais dados na página
        $('#nomeEmpresa').append(dado.empresa.estabelecimento);
        $('#tituloPromo').append(dado.anuncio.titulo);
        $('#descPromo').append(dado.anuncio.descricao);
        $('#valoresPromo').append(conteudo);
    });
}




/**
 * Função que obtém os dados básicos de todas os anúncios próximos ao visitante
 */
function getHistoricoPromos(mostraLoad){
    (mostraLoad !== null)? mostraLoad:true;

    if(mostraLoad){
        if($('.loading-image').length == 0){
            $('body').append('<span class="loading-image load-bottom"></span>');
        }
    }
    // Remove os resultados
    $('.lista').remove();
    $('#no-result').remove();

    // Desabilita o botão de atualizar durante a atualização
    $('.btn-update').attr('disabled', 'true');
    $('.btn-update').addClass('btn-disabled');

    $.ajax({
        url: urlRaiz + '/api/user/history/promocoes',
        dataType: 'json',
        success: function(dados){
            $('.loading-image').remove();

            // PROMOÇÕES OBTIDAS HOJE:
            $('#hoje').append('<h3 class="textleft titulo-bloco">Hoje</h3>');

            // Exibe cada promoção obtida "HOJE"
            if($(dados['hoje']).length > 1) { // Caso haja mais de uma
                $(dados['hoje']).each(function (checkin) {
                    $('#hoje').append('<div class="lista clickable" onclick="location.href=\'promocaoresgatada.html?' +
                        dados['hoje'][checkin]['id_promocao'] + '&' + dados['hoje'][checkin]['id'] + '\'" ' +
                        'id="' + dados['hoje'][checkin]['id'] + '"></div>');

                    // Busca a promoção com base no checkin para exibir seus dados
                    buscaPromo(dados['hoje'][checkin]['id_promocao'], function (dado, checkin) {
                        $('#' + checkin['id']).append('<h3 class="tituloPromo">' + dado['anuncio']['titulo'] + '</h3>' +
                            '<span class="gray mini nomeEmpresa" style="display:block;margin-bottom:10px">' +
                            dado['empresa']['estabelecimento'] +
                            '</span>');

                        var arrDataHora = breakDateTime(checkin['datahora']);
                        $('#' + checkin['id']).append(
                            arrDataHora['hora'] + ':' + arrDataHora['minuto']
                        );
                    }, dados['hoje'][checkin]);

                });
            } else if ($(dados['hoje']).length === 1){ // Caso haja apenas uma
                    $('#hoje').append('<div class="lista clickable" onclick="location.href=\'promocaoresgatada.html?' +
                        dados['hoje'].Checkin.id_promocao + '&' + dados['hoje'].Checkin.id + '\'" ' +
                        'id="' + dados['hoje'].Checkin.id + '"></div>');

                    // Busca a promoção com base no checkin para exibir seus dados
                    buscaPromo(dados['hoje'].Checkin.id_promocao, function (dado, checkin) {
                        $('#' + checkin['id']).append('<h3 class="tituloPromo">' + dado['anuncio']['titulo'] + '</h3>' +
                            '<span class="gray mini nomeEmpresa" style="display:block;margin-bottom:10px">' +
                            dado['empresa']['estabelecimento'] +
                            '</span>');

                        var arrDataHora = breakDateTime(checkin.datahora);
                        $('#' + checkin.id).append(
                            arrDataHora['hora'] + ':' + arrDataHora['minuto']
                        );
                    }, dados['hoje'].Checkin);
            } else { // Caso não haja nenhuma
                $('#hoje').append('<p class="textcontent gray">Nada ainda. Que tal aproveitar umas promoções?</p>');
            }



            // PROMOÇÕES OBTIDAS ANTES DE HOJE:
            // Exibe cada promoção obtida "ANTERIORMENTE", apenas caso haja ao menos uma
            if($(dados['anteriores']).length > 0) {
                $('<div class="bloco" id="anteriores" style="max-height: none; overflow: hidden;"></span></div>')
                    .insertAfter('#hoje');

                $('#anteriores').append('<h3 class="textleft titulo-bloco">Anteriores</h3>');

                if ($(dados['anteriores']).length > 1) { // Caso haja mais de uma
                    $(dados['anteriores']).each(function (checkin) {

                        $('#anteriores').append('<div class="lista clickable" onclick="location.href=\'promocaoresgatada.html?' +
                            dados['anteriores'][checkin]['id_promocao'] + '&' + dados['anteriores'][checkin]['id'] + '\'" ' +
                            'id="' + dados['anteriores'][checkin]['id'] + '"></div>');

                        // Busca a promoção com base no checkin para exibir seus dados
                        buscaPromo(dados['anteriores'][checkin]['id_promocao'], function (dado, checkin) {
                            $('#' + checkin['id']).append('<h3 class="tituloPromo">' + dado['anuncio']['titulo'] + '</h3>' +
                                '<span class="gray mini nomeEmpresa" style="display:block;margin-bottom:10px">' +
                                dado['empresa']['estabelecimento'] +
                                '</span>');

                            var arrDataHora = breakDateTime(checkin['datahora']);
                            $('#' + checkin['id']).append(
                                arrDataHora['dia'] + '/' + arrDataHora['mes'] + '/' + arrDataHora['ano'] + ', às ' +
                                arrDataHora['hora'] + ':' + arrDataHora['minuto']
                            );
                        }, dados['anteriores'][checkin]);

                    });
                } else if ($(dados['anteriores']).length === 1) { // Caso haja apenas uma
                    $('#anteriores').append('<div class="lista clickable" onclick="location.href=\'promocaoresgatada.html?' +
                        dados['anteriores'].Checkin.id_promocao + '&' + dados['anteriores'].Checkin.id + '\'" ' +
                        'id="' + dados['anteriores'].Checkin.id + '"></div>');

                    // Busca a promoção com base no checkin para exibir seus dados
                    buscaPromo(dados['anteriores'].Checkin.id_promocao, function (dado, checkin) {
                        $('#' + checkin['id']).append('<h3 class="tituloPromo">' + dado['anuncio']['titulo'] + '</h3>' +
                            '<span class="gray mini nomeEmpresa" style="display:block;margin-bottom:10px">' +
                            dado['empresa']['estabelecimento'] +
                            '</span>');

                        var arrDataHora = breakDateTime(checkin.datahora);
                        $('#' + checkin.id).append(
                            arrDataHora['dia'] + '/' + arrDataHora['mes'] + '/' + arrDataHora['ano'] + ', às ' +
                            arrDataHora['hora'] + ':' + arrDataHora['minuto']
                        );
                    }, dados['anteriores'].Checkin);
                }
            }
        },
        error: function(dados){
            console.log(dados);
            alert('Houve um erro.');
        }
    });
}



// Obtém os dados do usuário logado e exibe na página
function getDadosUsuario () {
    $.ajax({
        url: urlRaiz + '/api/user/getinfo',
        dataType: 'json',
        success: function (data) {
            $('.loading-image').remove();

            if(data.Cliente.oauth_uid === '') {
                var dataNasc = breakDate(data.Cliente.nascimento);


                var contUser = '<span class="textcontent">';
                contUser += '<span class="mini gray">Conectado como</span><br>';
                contUser += data.Cliente.email + '<br><br><br>';
                contUser += '<b class="mini">Nome:</b>';
                contUser += '<input type="text" class="input input-full textcenter" id="nomeusuario" ' +
                    'placeholder="Seu nome" value="' + data.Cliente.nome + '"><br>';
                contUser += '<b class="mini">Data de nascimento: </b>';
                contUser += '<input type="text" class="input input-full textcenter" id="datanascimento" ' +
                    'placeholder="Sua data de nascimento (dd/mm/aaaa)" pattern="[0-9]{2,2}\/[0-9]{2,2}\/[0-9]{4,4}"' +
                    'value="' + dataNasc['dia'] + '/' + dataNasc['mes'] + '/' + dataNasc['ano'] + '"><br>';
                contUser += '<span class="btn btn-square" id="btnUpdate" onclick="updateUserInfo()">' +
                    'Atualizar dados</span>';
                contUser += '</span>';
                $('.container').append(contUser);


                $('body').append('<div class="bloco" id="alterarsenha"></div>');

                var contAltSenha = '<h4 class="titulo-bloco textleft">Alterar senha</h4><span class="textcontent">';
                contAltSenha += '<input type="password" class="input input-full textcenter" id="senhaatual" ' +
                    'placeholder="Senha atual"><br>';
                contAltSenha += '<input type="password" class="input input-full textcenter" id="novasenha" ' +
                    'placeholder="Nova senha"><br>';
                contAltSenha += '<input type="password" class="input input-full textcenter" id="confirmacao" ' +
                    'placeholder="Repita a nova senha"><br>';
                contAltSenha += '<span class="btn btn-square" id="btnChangePass" onclick="updateUserPassword()">' +
                    'Confirmar</span></span>';
                $('#alterarsenha').append(contAltSenha);
            }
            else { // Remove o bloco inicial caso não haja o que mostrar nele
                $('.container').remove();
            }


            $('body').append('<div class="bloco clickable" id="cadeu" onclick="window.open(\''+linkCadeu +
                '\',\'_blank\');"></div>');
            var contCad = '<h5 class="titulo-bloco textleft">Divulgação</h5>';
            contCad += '<span class="textcontent">';
            contCad += '<b>Organize suas contas online</b><br>Conheça o Cadêu<br><br>' +
                '<span class="mini gray">Toque aqui para acessar</span></span ';
            $('#cadeu').append(contCad);

            // Adiciona a classe container ao bloco de divulgação para ajustá-lo ao layout
            if(data.Cliente.oauth_uid !== '') {
                $('#cadeu').addClass('container');
            }


            $('body').append('<div class="bloco bloco-separador" id="logout"></div>');
            $('#logout').append('<div class="lista clickable" onclick="logout()">' +
                '<span class="textcontent" style="margin-top: 30px">Toque aqui para se desconectar</span>' +
                '</div>');
        },
        error: function (data) {
            console.log(data);
            alert('Houve um problema');
        }
    });
}


// Envia os dados para atualizar os dados do usuário no banco
function updateUserInfo () {
    var nome = $('#nomeusuario').val();
    var nascimento = $('#datanascimento').val();
    var regexNasc = new RegExp('^[0-9]{2,2}\/[0-9]{2,2}\/[0-9]{4,4}$');

    $('.container .alert').remove();

    // Validação dos campos
    if(nome === '' || nascimento === '' || !regexNasc.test(nascimento)) {
        if (nome === '' || nascimento === '') {
            $('<div class="alert alert-erro">Todos os campos devem estar preenchidos</div>').insertBefore('#btnUpdate');
        }
        if (!regexNasc.test(nascimento)) {
            if($('.container .alert-erro').length === 0) {
                $('<span class="alert alert-erro">Informe sua data de nascimento no padrão dd/mm/aaaa</span>')
                    .insertBefore('#btnUpdate');
            } else {
                $('.container .alert-erro').append('<br><br>Informe sua data de nascimento no padrão dd/mm/aaaa');
            }
        }
    } else {
        // Execução da consulta para atualizar os dados
        $('body').append('<span class="loading-image load-bottom"></span>');
        $.ajax({
            url: urlRaiz + '/api/user/updateinfo',
            dataType: 'json',
            method: 'post',
            data: {'nome':nome, 'nascimento':nascimento},
            success: function (data) {
                $('.load-bottom').remove();
                $('.container .alert').remove();
                $('<div class="alert alert-sucesso">Seus dados foram atualizados</div>').insertBefore('#btnUpdate');
            },
            error: function (data) {
                $('.load-bottom').remove();
                $('.container .alert').remove();
                console.log(data);
                alert('Não foi possível atualizar seus dados');
            }
        });
    }
}


// Envia os dados para atualizar a senha do usuário no banco
function updateUserPassword () {
    var oldPass = $('#senhaatual').val();
    var newPass = $('#novasenha').val();
    var confirm = $('#confirmacao').val();

    $('#alterarsenha .alert').remove();

    // Validar se nenhum campos está em branco e tudo mais
    if (oldPass === '' || newPass === '' || confirm === '' || newPass !== confirm || newPass === oldPass){
        if (oldPass === '' || newPass === '' || confirm === '') {
            $('<div class="alert alert-erro">Todos os campos devem estar preenchidos</div>')
                .insertBefore('#btnChangePass');
        }
        if (newPass === oldPass) { // Caso a nova senha e senha atual sejam iguais
            if($('#alterarsenha .alert-erro').length === 0) {
                $('<span class="alert alert-erro">A nova senha não pode ser igual à senha atual</span>')
                    .insertBefore('#btnChangePass');
            } else {
                $('#alterarsenha .alert-erro').append('<br><br>A nova senha não pode ser igual à senha atual');
            }
        }
        if (newPass !== confirm) { // Caso a nova senha e a confirmação difiram entre si
            if($('#alterarsenha .alert-erro').length === 0) {
                $('<span class="alert alert-erro">A confirmação deve ser igual à nova senha</span>')
                    .insertBefore('#btnChangePass');
            } else {
                $('#alterarsenha .alert-erro').append('<br><br>A confirmação deve ser igual à nova senha');
            }
        }
    } else {
        // Execução da consulta para atualizar os dados
        $('body').append('<span class="loading-image load-bottom"></span>');
        $.ajax({
            url: urlRaiz + '/api/user/updatepassword',
            dataType: 'json',
            method: 'post',
            data: {'senhaatual':oldPass, 'novasenha':newPass, 'confirmacao':confirm},
            success: function (data) {
                $('.load-bottom').remove();
                $('#alterarsenha .alert').remove();
                if (data === true)
                    $('<div class="alert alert-sucesso">Sua senha foi alterada. Ao se conectar novamente, utilize a ' +
                        'nova senha</div>').insertBefore('#btnChangePass');
                else if (data === false)
                    $('<div class="alert alert-erro">Não foi possível atualizar sua senha</div>')
                        .insertBefore('#btnChangePass');
                else if (data === -1)
                    $('<div class="alert alert-erro">A senha atual está incorreta</div>')
                        .insertBefore('#btnChangePass');
            },
            error: function (data) {
                $('.load-bottom').remove();
                $('.alert').remove();
                console.log(data);
                alert('Não foi possível atualizar seus dados');
            }
        });
    }
}




// Função que quebra uma datetime/timestamp e retorna um vetor com cada valor da data
function breakDateTime (datahora) {
    var ano = datahora.substr(0, 4);
    var mes = datahora.substr(5, 2);
    var dia = datahora.substr(8, 2);

    var hora = datahora.substr(11, 2);
    var minuto = datahora.substr(14, 2);
    var segundo = datahora.substr(17, 2);

    return {ano:ano, mes:mes, dia:dia, hora:hora, minuto:minuto, segundo:segundo}
}

// Função que quebra uma date e retorna um vetor com cada valor da data
function breakDate (date) {
    var ano = date.substr(0, 4);
    var mes = date.substr(5, 2);
    var dia = date.substr(8, 2);

    return {ano:ano, mes:mes, dia:dia}
}


/**
 * Função que formata um número (inteiro ou com ponto como separador decimal) dado,
 * no padrão 'XXX,ZZ' de dinheiro usado no Brasil e coloca as casas decimais menores
 * e sobrescritas ao valor principal.
 */
function moneyFormat( numero ){
    numero = numero.split('.');
    if(numero[1]){
        if(numero[1].length == 1)
            numero[1] += '0';
    } else{
        numero[1] = '00';
    }
    return numero[0] + '<sup>,' + numero[1] + '</sup>';
}

/**
 * Função que obtém os dados passados por GET na página.
 */
function obtemGet(){
    return window.location.search.substring(1).split('&');
}

// Função que realiza o logout do usuário
function logout () {
    $.ajax({
        url: urlRaiz + '/api/user/logout',
        dataType: 'json',
        success: function(dados){

            // Inclui o arquivo de autenticação do FB, que fará o logout do Facebook e redirecionará
            // para a index, mesmo se o login foi feito pelo sistema próprio de usuários
            var fbcont = '<script src="assets/js/fbAuth.js"></script><div id="fb-root"></div>';
            $(fbcont).insertBefore('#colorheader');

        },
        error: function(dados){
            console.log(dados);
            alert('Não foi possível desconectar.');
        }
    });
}