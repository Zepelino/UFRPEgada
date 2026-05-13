import { supabase } from './supabaseClient.js';

export async function buscarEmissaoTotal() {
    const { data, error } = await supabase
        .from('activity_logs')
        .select(`
            quantidade,
            activities ( consumo_por_hora )
        `);

    if (error) return 0;

    return data.reduce((acc, log) => {
        const fator = log.activities?.consumo_por_hora || 0;
        return acc + (parseFloat(log.quantidade) * fator);
    }, 0);
}

export async function registrarNoBanco(atividadeId, horas) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
        .from('activity_logs')
        .insert([
            { 
                activity_id: atividadeId, 
                quantidade: parseFloat(horas),
                user_id: user.id 
            }
        ]);

    if (error) throw error;
}