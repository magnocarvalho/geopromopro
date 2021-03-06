/*
* @author Vinicius Baroni Soares
*/

urlRaiz = 'http://localhost/geopromo/ServerBack';

// Verifica se o usuário atual está autenticado no sistema
function getAuth() {
    $.ajax({
        url: urlRaiz+'/api/getauth',
        dataType: 'json',
        success: function (data) {
            showLogin1Content(data);
        },
        error: function (data) {
            alert("Houve um problema");
        }
    });
}


// Exibe os dados da página inicial com base na autenticação do usuário
function showLogin1Content (isLogged) {
    $('.loading-image').remove();

    $('.container').empty();
    $('.container').append('<span class="textcontent"></span>');

    if(isLogged) {
        // Redireciona para a página home.html caso já esteja logado
        location.href='home.html';

    } else {
        $('#fbArea').remove();
        var fbcont = '<div id="fbArea"><script src="assets/js/fbAuth.js"></script><div id="fb-root"></div></div>';
        $(fbcont).insertBefore('#colorheader');


        var conteudo = '<span id="cont"><h2 class="colororange">Conecte-se para encontrar promoções próximas</h2>';
        conteudo += '<p>Conecte-se à sua conta ou crie uma nova.</p><br>';
        conteudo += '<input type="email" class="input input-full textcenter" id="emailLogin" ' +
            'placeholder="Informe seu email"><br>';
        conteudo += '<span id="btnArea"><span class="btn btn-square" id="btnContinuar" onclick="loginEmail($(\'#emailLogin\').val())">' +
            'Continuar</span></span></span>';

        conteudo += '<br><div id="fbLoginButton"><p>Ou então</p>';
        conteudo += '<div class="fb-login-button" data-max-rows="1" data-size="medium" ' +
            'data-button-type="continue_with" data-show-faces="false" data-auto-logout-link="false" ' +
            'data-use-continue-as="false" data-width="200" onlogin="getFbUserData()"></div><br><br></div>';

        $('.textcontent').append(conteudo);
    }
}


// Envia o email ao servidor para verificar se já está registrado
function loginEmail(email) {
    $('body').append('<span class="loading-image load-bottom"></span>');

    var regexEmail = new RegExp('^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,4}$');

    if(email == '' || !regexEmail.test(email)) {
        $('.load-bottom').remove();
        $('.alert-erro').remove();
        $('<span class="alert alert-erro">Insira seu email (deve ser um endereço válido)</span>')
            .insertAfter('#emailLogin');
    } else {
        $.ajax({
            url: urlRaiz+'/api/user/checkemail',
            dataType: 'json',
            method: 'post',
            data: {'email': email},
            success: function (data) {
                $('.load-bottom').remove();
                showLogin2Content(data);
            },
            error: function (data) {
                $('.load-bottom').remove();
                alert("Houve um erro");
            }
        });
    }
}

// Mostra o conteúdo na página com base na existência ou não do login no BD
function showLogin2Content (emailExistente) {
    if(emailExistente){
        showLogin3Content();

    } else {
        $('.btn').remove();
        $('.alert').remove();
        // var conteudo = '<h2 class="colororange">Este email não está cadastrado</h2>';
        // conteudo += '<p>ocê pode mudá-lo e tentar se conectar novamente ou pode se cadastrar usando este email.</p><br>';
        $('#cont h2').html('Este email não está cadastrado');
        $('#cont p').html('Você pode mudá-lo e tentar se conectar novamente ou pode se cadastrar usando este email.');

        var conteudo = '<span class="btn btn-square btn-secundary" id="btnContinuar" ' +
            'onclick="loginEmail($(\'#emailLogin\').val())" ' +
            'style="width:35%; margin-right:10px">Conectar</span>';

        conteudo += ' <span class="btn btn-square" id="btnCadastrar" onclick="cadastroEmail($(\'#emailLogin\').val())" ' +
            'style="width:35%; margin-left:10px">' +
            'Cadastrar-se</span>';

        $('#btnArea').html(conteudo);
    }
}

// Mostra o conteúdo da página para inserir a senha e realizar o login
function showLogin3Content () {
    $('.loading-image').remove();

    $('.textcontent').empty();


    var conteudo = '<h2 class="colororange">Conecte-se para encontrar promoções próximas</h2>';
    conteudo += '<p>Informe sua senha para entrar na sua conta.</p><br>';
    conteudo += '<input type="password" class="input input-full textcenter" id="senhalogin" ' +
        'placeholder="Informe sua senha"><br>';
    conteudo += '<span class="btn btn-square" id="btnContinuar" onclick="realizarLogin($(\'#senhalogin\').val())">' +
        'Continuar</span>';

    $('.textcontent').append(conteudo);
}

// Confere se a senha digitada corresponde à gravada no banco de dados e realiza o login
function realizarLogin (senha) {
    $('body').append('<span class="loading-image load-bottom"></span>');
    if(senha == '') {
        $('.load-bottom').remove();
        $('.alert-erro').remove();
        $('<span class="alert alert-erro">Informe sua senha para entrar</span>').insertAfter('#senhalogin');
    } else {
        $.ajax({
            url: urlRaiz+'/api/user/checksenha',
            dataType: 'json',
            method: 'post',
            data: {'senha': senha},
            success: function (data) {
                $('.load-bottom').remove();

                if(data == -1){
                    $('.alert-erro').remove();
                    $('<span class="alert alert-erro">Muitas tentativas incorretas de acesso. Tente novamente após 2 ' +
                        'horas.</span>').insertAfter('#senhalogin');

                } else if(data == false){
                    $('.alert-erro').remove();
                    $('<span class="alert alert-erro">Senha incorreta</span>').insertAfter('#senhalogin');
                } else {
                    location.href='home.html';
                }
            },
            error: function (data) {
                $('.load-bottom').remove();
                alert("Houve um erro");
            }
        });
    }
}





// Envia o email ao servidor para iniciar o cadastro
function cadastroEmail(email) {
    $('body').append('<span class="loading-image load-bottom"></span>');
    if(email == '') {
        $('.load-bottom').remove();
        $('.alert-erro').remove();
        $('<span class="alert alert-erro">Insira seu email</span>').insertAfter('#emailLogin');
    } else {
        $.ajax({
            url: urlRaiz+'/api/user/register/email',
            dataType: 'json',
            method: 'post',
            data: {'email': email},
            success: function (data) {
                $('.load-bottom').remove();
                showRegister1Content();
            },
            error: function (data) {
                $('.load-bottom').remove();
                alert("Houve um erro");
            }
        });
    }
}

// Exibe os dados da página de registro (etapa 1) - TODO: semelhante ao login
function showRegister1Content () {
    $('.loading-image').remove();

    $('.textcontent').empty();


        var conteudo = '<h2 class="colororange">Crie sua conta, é rapidinho</h2>';
        conteudo += '<p>Defina agora sua senha de acesso à conta.</p><br>';
        conteudo += '<input type="password" class="input input-full textcenter" id="senharegistro" ' +
            'placeholder="Defina a senha"><br>';
        conteudo += '<span class="btn btn-square" id="btnContinuar" onclick="cadastroSenha($(\'#senharegistro\').val())">' +
            'Continuar</span>';

        $('.textcontent').append(conteudo);
}


// Envia a senha ao servidor para armazenar no objeto
function cadastroSenha(senha) {
    $('body').append('<span class="loading-image load-bottom"></span>');
    if(senha == '') {
        $('.load-bottom').remove();
        $('.alert-erro').remove();
        $('<span class="alert alert-erro">Defina uma senha para a conta</span>').insertAfter('#senharegistro');
    } else {
        $.ajax({
            url: urlRaiz+'/api/user/register/senha',
            dataType: 'json',
            method: 'post',
            data: {'senha': senha},
            success: function (data) {
                $('.load-bottom').remove();
                showRegister2Content();
            },
            error: function (data) {
                $('.load-bottom').remove();
                alert("Houve um erro");
            }
        });
    }
}

// Exibe os dados da página de registro (etapa 2)
function showRegister2Content () {
    $('.loading-image').remove();

    $('.textcontent').empty();


    var conteudo = '<h2 class="colororange">Crie sua conta, é rapidinho</h2>';
    conteudo += '<p>Para finalizar, diga-nos um pouco mais de você.</p><br>';
    conteudo += '<input type="text" class="input input-full textcenter" id="nomeusuario" ' +
        'placeholder="Seu nome"><br>';
    conteudo += '<input type="text" class="input input-full textcenter" id="datanascimento" ' +
        'placeholder="Sua data de nascimento (dd/mm/aaaa)" pattern="[0-9]{2,2}\/[0-9]{2,2}\/[0-9]{4,4}"><br>';
    conteudo += '<span class="btn btn-square" id="btnContinuar" onclick="cadastroInfo($(\'#nomeusuario\').val(), ' +
        '$(\'#datanascimento\').val())">' +
        'Concluir</span>';

    $('.textcontent').append(conteudo);
}

// Envia os demais dados ao servidor para armazenar no objeto
function cadastroInfo(nome, nasc) {
    $('body').append('<span class="loading-image load-bottom"></span>');

    $('.alert-erro').remove();
    var regexNasc = new RegExp('^[0-9]{2,2}\/[0-9]{2,2}\/[0-9]{4,4}$');

    if(nome == '' || nasc == '' || !regexNasc.test(nasc)) {
        if (nome == '') {
            $('.load-bottom').remove();
            $('<span class="alert alert-erro">Informe seu nome</span>').insertAfter('#nomeusuario');
        }
        if (nasc == '' || !regexNasc.test(nasc)) {
            $('.load-bottom').remove();
            $('<span class="alert alert-erro">Informe sua data de nascimento (no padrão dd/mm/aaaa)</span>')
                .insertAfter('#datanascimento');
        }
    }else {
        $.ajax({
            url: urlRaiz+'/api/user/register/dados',
            dataType: 'json',
            method: 'post',
            data: {'nome': nome, 'nascimento': nasc.replace(/\//g, '-')},
            success: function (data) {
                $('.load-bottom').remove();
                location.href='home.html';
            },
            error: function (data) {
                $('.load-bottom').remove();
                alert("Houve um erro");
            }
        });
    }
}