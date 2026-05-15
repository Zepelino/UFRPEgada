import { supabase } from './supabaseClient';

/**
 * Calcula o consumo e registra a atividade no Supabase.
 * Pode ser chamado diretamente pelo formulário do Frontend.
 * * @param {string} userId - ID do usuário logado
 * @param {Object} atividadeSelecionada - Objeto da atividade vindo da tabela 'activities' (precisa ter id e consumo_por_hora)
 * @param {number} duracaoEmHoras - O tempo total informado pelo usuário na interface
 */
export async function processarERegistrarAtividade(userId, atividadeSelecionada, duracaoEmHoras) {
  try {
    // 1. calcularConsumo() internamente
    // Multiplica as horas informadas pelo valor padrão da atividade
    const pegadaCalculada = duracaoEmHoras * atividadeSelecionada.consumo_por_hora;

    // 2. Gerar os timestamps de inicio e fim baseados na duração
    const dataFim = new Date(); // Considera o momento do registro como o fim da atividade
    const dataInicio = new Date(dataFim.getTime() - (duracaoEmHoras * 60 * 60 * 1000)); // Subtrai as horas em milissegundos

    // 3. registrarAtividade() no Supabase
    const { data, error } = await supabase
      .from('activity_logs')
      .insert([
        {
          user_id: userId,
          activity_id: atividadeSelecionada.id,
          inicio: dataInicio.toISOString(), // Formato exigido pelo timestamptz do BD
          fim: dataFim.toISOString(),       // Formato exigido pelo timestamptz do BD
          pegada_total: pegadaCalculada     // O valor numérico final do consumo
        }
      ])
      .select();

    if (error) throw error;

    console.log("Sucesso! O Log foi gerado sem quebrar a UI.", data);
    return { sucesso: true, dados: data };

  } catch (erro) {
    console.error("Erro na comunicação com o banco:", erro.message);
    return { sucesso: false, erro: erro.message };
  }
}