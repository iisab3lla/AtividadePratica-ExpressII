import express, { request, response } from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'

const app = express()

app.use(cors())
app.use(express.json())

//POST

let listagemCarros = [];
let adicionarCarro = 1;
let admins = [];
let proximoAdmin = 1;

app.post('/carros', (request,response) =>{
    const marca = request.body.marca;
    const modelo = request.body.modelo;
    const cor = request.body.cor;
    const ano = Number(request.body.ano);
    const preco = Number(request.body.preco);

    if(!marca){
        response.status(400).send('Informe uma marca válida!');
    }
    if(!modelo){
        response.status(400).send('Informe um modelo válido!');
    }
    if(!cor){
        response.status(400).send('Informe uma cor válida!');
    }
    if(!ano){
        response.status(400).send('Informe um ano válido!');
    }
    if(!preco){
        response.status(400).send('Informe um preço válido!');
    }

    let informacoesCarros = {
        id: adicionarCarro,
        marca: marca,
        modelo: modelo,
        cor: cor,
        ano: ano,
        preco: preco
    }

    listagemCarros.push(informacoesCarros)

    adicionarCarro++

    response.status(201).send(`
      Carro adicionado com sucesso!
    `)
});

//GET

app.get('/carros',(request,response) =>{

    if(listagemCarros.length === 0){
        response.status(400).send('Nenhum carro cadastrado. Adicione um carro para obter informações!');
    }
    
    const dados = listagemCarros.map((carro)=>`ID: ${carro.id} | Modelo: ${carro.modelo}| Marca: ${carro.marca} | Ano: ${carro.ano} | Cor: ${carro.cor} | Preço: R$ ${carro.preco}`)

    response.status(200).send(dados);
})

// GET - FILTER
app.get('/filtro', (request, response) => {
    const marca = request.body.marca;
    
    if (!marca) {
        response.status(400).send('Forneça uma marca válida para filtrar!');
    }
    
    const carroFiltrado = listagemCarros.filter(carro => carro.marca === marca);

    if (listagemCarros.length === 0) {
        response.status(404).send('Nenhum carro cadastrado!');
    }
    if(carroFiltrado.length === 0){
        response.status(404).send('Nenhum carro com esta marca cadastrada!');
    }
    const dados = carroFiltrado.map((carro)=> `ID: ${carro.id} | Modelo: ${carro.modelo} | Cor: ${carro.cor} | Preço: ${carro.preco}`)

    response.status(200).json({success: true, data: dados})
});

//atualizar
// http://localhost:8080/carros/:procurarId
app.put("/carros/:procurarId", (request, response) =>{
    const cor = request.body.cor;
    const preco = Number(request.body.preco);

    const procurarId = Number(request.params.procurarId);

    if(!procurarId){
        response.status(400).send(JSON.stringify({Mensagem: "Por favor insira um ID válido!"}))
    }

    const verificadorId = listagemCarros.findIndex(carro => carro.id === procurarId);

    if(verificadorId === -1){
        response.status(400).send(JSON.stringify({Mensagem: "Veículo não encontrado. O usuário deve voltar para o menu inicial."}))
    }
    if(!cor){
        response.status(400).send(JSON.stringify({Mensagem: "Informe uma cor válida!"}));
    }
    if(!preco){
        response.status(400).send(JSON.stringify({Mensagem: "Informe um preço válido!"}));
    }

    if(verificadorId != -1){
        const carros = listagemCarros[verificadorId]
        carros.cor = cor;
        carros.preco = preco;

        response.status(200).send(JSON.stringify({Mensagem: `A cor: ${carros.cor} foi atualizada com sucesso! `,
        Mensagem2: `O preço: ${carros.preco} foi atualizado com sucesso!`}));
    }
});

//DELETE
app.delete('/carros/:procurarId', (request, response) =>{
    const procurarId = Number(request.params.procurarId)

    if(!procurarId){
        response.status(400).send(JSON.stringify({Mensagem: "Por favor insira um ID válido!"}));
    }

    const posicaoCarro = listagemCarros.findIndex(carro => carro.id === procurarId);

    if(posicaoCarro === -1){
        response.status(400).send(JSON.stringify({Mensagem:"ID não encontrado!"}));
    }else{
        listagemCarros.splice(posicaoCarro,1);
        response.status(200).send(JSON.stringify({Mensagem:"Carro deletado com sucesso!"}));
    }
});

//SINGUP

app.post('/singup',async (request, response)=>{
    const nome = request.body.nome;
    const email = request.body.email;
    const senhaDigitada = request.body.senhaDigitada;

    if(!nome){
        response.status(400).send(JSON.stringify({Mensagem: "Insira um nome válido para continuar!"}));
    }
    if(!email){
        response.status(400).send(JSON.stringify({Mensagem: "Insira um email válido para poder continuar!"}));
    }
    if(!senhaDigitada){
        response.status(400).send(JSON.stringify({Mensagem: "Insira uma senha válida para poder continuar!"}));
    }

    const verificarEmail = admins.find((admin) => admin.email === email);

    if(verificarEmail){
        response.status(400).send(JSON.stringify({Mensagem: "Email já cadatrado em nosso banco de dados!"}));
    }

    const senhaCriptografada = await bcrypt.hash(senhaDigitada,10);

    let novaPessoaAdministradora= {
        id: proximoAdmin,
        nome: request.body.nome,
        email: request.body.email,
        senhaDigitada: senhaCriptografada
    }

    admins.push(novaPessoaAdministradora);
    proximoAdmin++

    response.status(201).send(JSON.stringify({Mensagem: `Senhor(a) ${nome} de Email: ${email}, seus dados foram cadastrados com sucesso!`}));

});

//LOGIN

app.get('/login',async(request, response) =>{
    const data = request.body

    const email = data.email;
    const senha = data.senha;

    if(!email){
        response.status(400).send(JSON.stringify({Mensagem: "Insira um email válido para poder continuar!"}));
        return;
    }
    if(!senha){
        response.status(400).send(JSON.stringify({Mensagem: "Insira uma senha válida para poder continuar!"}));
        return;
    }

    const admin = admins.find(admin => admin.email === email);

    if(!admin){
        response.status(404).send(JSON.stringify({Mensagem:"Email inválido"}));
        return;
    }

    const senhaCompativel = await bcrypt.compare(senha, admin.senhaDigitada);

    if(!senhaCompativel){
        response.status(400).send(JSON.stringify({Mensagem: "Senha não encontrada em nosso banco de dados. Credencial inválida"}));
        return;
    }

    response.status(200).send(JSON.stringify({Mensagem: `Pessoa com email ${email}, foi logada com sucesso! Seja Bem-Vindo(a)!` }));
});

app.listen(8080, () => console.log("Servidor iniciado")); 
