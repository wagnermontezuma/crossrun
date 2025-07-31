// Importa o SDK do Mercado Pago
import mercadopago from 'mercadopago';

// Esta é a função que a Vercel executará quando o endpoint /api/create-payment for chamado
export default async function handler(request, response) {
    // Pega seu Access Token do Mercado Pago das variáveis de ambiente
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    // Permite apenas requisições do tipo POST
    if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST');
        return response.status(405).end('Method Not Allowed');
    }

    // Verifica se a chave de acesso foi configurada
    if (!accessToken) {
        console.error('ERRO: MERCADO_PAGO_ACCESS_TOKEN não foi configurada no servidor.');
        return response.status(500).json({ error: 'Erro de configuração do servidor.' });
    }

    // Configura o SDK dentro do handler para garantir que sempre use o token mais recente
    mercadopago.configure({
        access_token: accessToken,
    });

    try {
        const { name, email, cpf, modality, shirt_size } = request.body;

        // Validação básica dos dados recebidos
        if (!name || !email || !cpf || !modality || !shirt_size) {
            return response.status(400).json({ error: 'Dados do formulário incompletos.' });
        }

        // Objeto de preferência para o pagamento
        const preference = {
            items: [
                {
                    title: `Inscrição Cross Run - ${modality}`,
                    description: `Kit do atleta com camisa tamanho ${shirt_size}`,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: 75.00 // <-- MUDE AQUI o valor da inscrição, se necessário
                }
            ],
            payer: {
                name: name,
                email: email,
                identification: {
                    type: 'CPF',
                    number: cpf.replace(/\D/g, '') // Remove pontos e traços do CPF
                }
            },
            // URLs de redirecionamento dinâmicas usando variáveis de ambiente da Vercel
            // Isso funciona tanto em produção (https) quanto em previews de deploy.
            // Você precisará criar os arquivos sucesso.html, falha.html, etc., na pasta /public
            back_urls: {
                success: `https://${process.env.VERCEL_URL}/sucesso.html`,
                failure: `https://${process.env.VERCEL_URL}/falha.html`,
                pending: `https://${process.env.VERCEL_URL}/pendente.html`
            },
            auto_return: 'approved',
        };

        const result = await mercadopago.preferences.create(preference);
        response.status(201).json({ init_point: result.body.init_point });

    } catch (error) {
        console.error('Erro ao criar preferência no Mercado Pago:', error);
        response.status(500).json({ error: 'Falha ao gerar o link de pagamento.' });
    }
}