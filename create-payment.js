// Importa o SDK do Mercado Pago
import mercadopago from 'mercadopago';

// Pega seu Access Token do Mercado Pago das variáveis de ambiente da Vercel
// IMPORTANTE: Você deve configurar esta variável no painel do seu projeto na Vercel.
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

if (accessToken) {
    mercadopago.configure({
        access_token: accessToken,
    });
}

// Esta é a função que a Vercel executará quando o endpoint /api/create-payment for chamado
export default async function handler(request, response) {
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

    try {
        const { name, email, cpf, modality } = request.body;

        // Validação básica dos dados recebidos
        if (!name || !email || !cpf || !modality) {
            return response.status(400).json({ error: 'Dados do formulário incompletos.' });
        }

        // Objeto de preferência para o pagamento
        const preference = {
            items: [
                {
                    title: `Inscrição Cross Run 1 Ano - ${modality}`,
                    description: 'Kit comemorativo do atleta',
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
            back_urls: {
                // IMPORTANTE: Substitua 'seu-dominio.vercel.app' pelo seu domínio final após o deploy
                success: 'https://seu-dominio.vercel.app/sucesso.html',
                failure: 'https://seu-dominio.vercel.app/falha.html',
                pending: 'https://seu-dominio.vercel.app/pendente.html'
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