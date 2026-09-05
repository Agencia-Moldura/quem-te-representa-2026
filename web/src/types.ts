// Espelha a view `candidatos` (sql/02_curada.sql).
export interface Candidato {
  sq_candidato: string
  nr_candidato: string | null
  nm_candidato: string
  nm_urna_candidato: string | null
  sg_uf: string
  nm_ue: string | null
  ds_cargo: string
  sg_partido: string | null
  nm_partido: string | null
  tp_agremiacao: string | null
  sq_coligacao: string | null
  nm_coligacao: string | null
  ds_composicao_coligacao: string | null
  ds_situacao_julgamento: string | null
  ds_genero: string | null
  ds_grau_instrucao: string | null
  ds_estado_civil: string | null
  ds_cor_raca: string | null
  ds_ocupacao: string | null
  st_reeleicao: string | null
  dt_nascimento: string | null
  idade: number | null
  foto_url: string | null
  valor_total_bens: number | null
  qtd_bens: number | null
}

// Linha da view `coligacoes_executivo`.
export interface ColigacaoExecutivo {
  sg_uf: string
  ds_cargo: string
  sq_coligacao: string | null
  nm_coligacao: string | null
  ds_composicao_coligacao: string | null
  sg_partido: string | null
  nm_partido: string | null
  ds_situacao: string | null
  espectro: string | null
  espectro_obs: string | null
}

export type Alinhamento = 'presidencial' | 'estadual'
