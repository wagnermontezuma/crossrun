// Countdown Timer Logic
const countdown = () => {
    const countDate = new Date('November 16, 2025 06:00:00').getTime();
    const now = new Date().getTime();
    const gap = countDate - now;

    if (gap < 0) {
        document.getElementById('countdown').innerHTML = '<p class="col-span-4 text-2xl font-bold">O grande dia chegou!</p>';
        return;
    }

    const second = 1000, minute = second * 60, hour = minute * 60, day = hour * 24;
    const textDay = Math.floor(gap / day), textHour = Math.floor((gap % day) / hour), textMinute = Math.floor((gap % hour) / minute), textSecond = Math.floor((gap % minute) / second);

    document.getElementById('days').innerText = String(textDay).padStart(2, '0');
    document.getElementById('hours').innerText = String(textHour).padStart(2, '0');
    document.getElementById('minutes').innerText = String(textMinute).padStart(2, '0');
    document.getElementById('seconds').innerText = String(textSecond).padStart(2, '0');
};
setInterval(countdown, 1000);

// Scroll Animation Logic
const sections = document.querySelectorAll('.fade-in-section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
sections.forEach(section => { observer.observe(section); });

// Mercado Pago Integration Logic
const form = document.getElementById('inscription-form');
const statusDiv = document.getElementById('form-status');
const submitButton = document.getElementById('submit-button');

const backendUrl = '/api/create-payment';

async function handleSubmit(event) {
    event.preventDefault();
    
    submitButton.disabled = true;
    statusDiv.innerHTML = '<p class="text-blue-600">Gerando link de pagamento, aguarde...</p>';

    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        cpf: document.getElementById('cpf').value,
        birthdate: document.getElementById('birthdate').value,
        shirt_size: document.getElementById('shirt-size').value,
        modality: document.getElementById('modality').value,
    };

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Falha na comunicação com o servidor.');
        const data = await response.json();
        if (data.init_point) window.location.href = data.init_point;
        else throw new Error('Link de pagamento não recebido.');

    } catch (error) {
        statusDiv.innerHTML = `<p class="text-red-600 font-bold">Erro: ${error.message}</p>`;
        submitButton.disabled = false;
    }
}
form.addEventListener("submit", handleSubmit);