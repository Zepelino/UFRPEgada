import { registrarNoBanco, buscarEmissaoTotal } from '../services/logService.js';

async function atualizarTela() {
    const total = await buscarEmissaoTotal();
    const display = document.getElementById('valor-emissao-total');
    if (display) display.innerText = `${total.toFixed(2)} kg CO2`;
}

document.addEventListener('DOMContentLoaded', () => {
    atualizarTela();

    const form = document.getElementById('meu-formulario-atividades');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('select-atividade').value;
            const tempo = document.getElementById('input-tempo').value;

            try {
                await registrarNoBanco(id, tempo);
                alert("Registrado com sucesso!");
                await atualizarTela();
                e.target.reset();
            } catch (err) {
                alert("Erro no Supabase: " + err.message);
                console.error(err);
            }
        });
    } else {
        alert("Erro Crítico: Formulário não encontrado no HTML!");
    }
});