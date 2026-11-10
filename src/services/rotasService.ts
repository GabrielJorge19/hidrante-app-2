import { db } from '../lib/db'
import { supabase } from '../lib/supabase'
import { caminhosDasFotos, type TipoProblema } from '../lib/problemas'
import type {
  MinhaRota,
  ParadaPendente,
  ParadaStatus,
  PosicaoAtual,
  RotaCache,
  RotaParadaCache,
  RotaStatus,
} from '../lib/rotaTypes'

type LinhaRota = {
  id: number
  data: string | null
  status: RotaStatus
  subprefeitura: string | null
  distrito: string | null
  observacao: string | null
}

type LinhaParada = {
  rota_id: number
  parada_key: string
  hidrante_id: number
  ativo: string | null
  endereco: string | null
  bairro: string | null
  distrito: string | null
  subprefeitura: string | null
  tipo: string | null
  ordem_servico: string | null
  ordem_servico_key: string
  os_status: string | null
  item_status: ParadaStatus
  observacao: string | null
  latitude: number
  longitude: number
  checkin_at: string | null
  checkin_lat: number | null
  checkin_lng: number | null
  concluido_em: string | null
  created_at: string
}

function normalizarRota(linha: LinhaRota): RotaCache {
  return { ...linha, cachedAt: Date.now() }
}

function normalizarParada(linha: LinhaParada): RotaParadaCache {
  return {
    paradaKey: linha.parada_key,
    rota_id: linha.rota_id,
    hidrante_id: linha.hidrante_id,
    ativo: linha.ativo,
    endereco: linha.endereco,
    bairro: linha.bairro,
    distrito: linha.distrito,
    subprefeitura: linha.subprefeitura,
    ordem_servico: linha.ordem_servico,
    ordem_servico_key: linha.ordem_servico_key,
    tipo: linha.tipo ?? null,
    os_status: linha.os_status,
    status: linha.item_status,
    observacao: linha.observacao,
    latitude: linha.latitude,
    longitude: linha.longitude,
    checkin_at: linha.checkin_at,
    checkin_lat: linha.checkin_lat,
    checkin_lng: linha.checkin_lng,
    concluido_em: linha.concluido_em,
    created_at: linha.created_at,
  }
}

/** Aplica as alterações ainda não enviadas sobre os dados em cache. */
async function aplicarPendentes(
  paradas: RotaParadaCache[],
  pendentes: ParadaPendente[],
): Promise<RotaParadaCache[]> {
  if (pendentes.length === 0) return paradas

  const ordenadas = pendentes.slice().sort((a, b) => a.criadoEm - b.criadoEm)
  const porParada = new Map(ordenadas.map((p) => [p.paradaKey, p]))

  return paradas.map((parada) => {
    const pendente = porParada.get(parada.paradaKey)
    if (!pendente) return parada

    return {
      ...parada,
      status: pendente.status,
      observacao: pendente.observacao ?? parada.observacao,
      checkin_at:
        pendente.status === 'concluido'
          ? parada.checkin_at ?? new Date(pendente.criadoEm).toISOString()
          : parada.checkin_at,
      checkin_lat:
        pendente.status === 'concluido'
          ? pendente.latitude ?? parada.checkin_lat
          : parada.checkin_lat,
      checkin_lng:
        pendente.status === 'concluido'
          ? pendente.longitude ?? parada.checkin_lng
          : parada.checkin_lng,
      concluido_em:
        pendente.status === 'concluido'
          ? new Date(pendente.criadoEm).toISOString()
          : null,
    }
  })
}

async function lerCache(): Promise<MinhaRota[]> {
  const [rotas, paradas, pendentes] = await Promise.all([
    db.rotas.toArray(),
    db.rotaParadas.toArray(),
    db.paradasPendentes.toArray(),
  ])

  const paradasComPendentes = await aplicarPendentes(paradas, pendentes)

  return rotas
    .slice()
    .sort((a, b) => {
      const dataA = a.data ?? '0000-00-00'
      const dataB = b.data ?? '0000-00-00'
      if (dataA !== dataB) return dataA < dataB ? 1 : -1
      return b.id - a.id
    })
    .map((rota) => ({
      rota,
      paradas: paradasComPendentes
        .filter((parada) => parada.rota_id === rota.id)
        .sort(
          (a, b) =>
            a.created_at.localeCompare(b.created_at) ||
            a.paradaKey.localeCompare(b.paradaKey),
        ),
    }))
}

/**
 * Carrega as rotas do encarregado. Se o Supabase estiver acessível,
 * atualiza o cache local; se não, devolve o que está no dispositivo.
 */
export async function carregarMinhasRotas(
  usuarioId: string,
): Promise<{ rotas: MinhaRota[]; online: boolean }> {
  if (!supabase || !navigator.onLine) {
    return { rotas: await lerCache(), online: false }
  }

  try {
    const [respostaRotas, respostaParadas] = await Promise.all([
      supabase
        .from('rotas')
        .select('id, data, status, subprefeitura, distrito, observacao')
        .eq('encarregado_id', usuarioId)
        .neq('status', 'cancelada')
        .order('data', { ascending: false, nullsFirst: false }),
      supabase
        .from('vw_rotas_itens')
        .select(
          'rota_id, parada_key, hidrante_id, ativo, endereco, bairro, distrito, subprefeitura, tipo, ordem_servico, ordem_servico_key, os_status, item_status, observacao, latitude, longitude, checkin_at, checkin_lat, checkin_lng, concluido_em, created_at',
        )
        .eq('encarregado_id', usuarioId)
        .order('created_at', { ascending: true })
        .order('parada_key', { ascending: true }),
    ])

    if (respostaRotas.error) throw respostaRotas.error
    if (respostaParadas.error) throw respostaParadas.error

    const rotas = ((respostaRotas.data ?? []) as LinhaRota[]).map(normalizarRota)
    const paradas = ((respostaParadas.data ?? []) as LinhaParada[]).map(normalizarParada)

    await db.transaction('rw', db.rotas, db.rotaParadas, async () => {
      await db.rotas.clear()
      await db.rotaParadas.clear()
      if (rotas.length > 0) await db.rotas.bulkPut(rotas)
      if (paradas.length > 0) await db.rotaParadas.bulkPut(paradas)
    })

    return { rotas: await lerCache(), online: true }
  } catch {
    return { rotas: await lerCache(), online: false }
  }
}

async function atualizarCacheParada(paradaKey: string, status: ParadaStatus) {
  const parada = await db.rotaParadas.get(paradaKey)
  if (!parada) return

  parada.status = status
  await db.rotaParadas.put(parada)
  await refletirStatusDaRota(parada.rota_id)
}

/** Espelha no aparelho a mesma regra da função marcar_parada. */
async function refletirStatusDaRota(rotaId: number) {
  const rota = await db.rotas.get(rotaId)
  if (!rota || rota.status === 'cancelada') return

  const paradas = await db.rotaParadas.where('rota_id').equals(rotaId).toArray()
  const aberta = paradas.some(
    (item) => item.status === 'pendente' || item.status === 'em_andamento',
  )

  if (!aberta && (rota.status === 'planejada' || rota.status === 'em_andamento')) {
    rota.status = 'concluida'
    await db.rotas.put(rota)
    return
  }

  const comecou = paradas.some(
    (item) => item.status === 'em_andamento' || item.status === 'concluido',
  )
  if (comecou && rota.status === 'planejada') {
    rota.status = 'em_andamento'
    await db.rotas.put(rota)
  }
}

/** Marca a parada no dispositivo e tenta enviar imediatamente ao Supabase. */
export async function marcarParada(params: {
  paradaKey: string
  rotaId: number
  hidranteId: number
  ordemServico: string | null
  status: ParadaStatus
  problemaTipo?: TipoProblema
  observacao?: string
  fotos?: Blob[]
}): Promise<{ enviado: boolean }> {
  const { paradaKey, rotaId, hidranteId, ordemServico, status, problemaTipo, observacao, fotos } = params

  if (status === 'nao_realizado') {
    if (!problemaTipo || !fotos || fotos.length < 1 || fotos.length > 3) {
      throw new Error('Escolha o problema e envie de 1 a 3 fotos.')
    }
  }

  const enfileirar = async () => {
    await db.paradasPendentes.where('paradaKey').equals(paradaKey).delete()
    await db.paradasPendentes.add({
      paradaKey,
      rotaId,
      hidranteId,
      ordemServico,
      status,
      observacao: null,
      latitude: null,
      longitude: null,
      problemaTipo: problemaTipo ?? null,
      problemaObservacao: observacao?.trim() || null,
      fotos: fotos ?? null,
      criadoEm: Date.now(),
    })
  }

  if (!supabase || !navigator.onLine) {
    await atualizarCacheParada(paradaKey, status)
    await enfileirar()
    return { enviado: false }
  }

  try {
    if (status === 'nao_realizado' && problemaTipo && fotos) {
      await enviarProblema({
        rotaId,
        hidranteId,
        ordemServico,
        problemaTipo,
        observacao,
        fotos,
      })
    } else {
      await enviarParada({ rotaId, hidranteId, ordemServico, status })
    }
    await atualizarCacheParada(paradaKey, status)
    await db.paradasPendentes.where('paradaKey').equals(paradaKey).delete()
    return { enviado: true }
  } catch (erro) {
    if (!navigator.onLine) {
      await atualizarCacheParada(paradaKey, status)
      await enfileirar()
      return { enviado: false }
    }
    throw erro
  }
}

async function enviarProblema(params: {
  rotaId: number
  hidranteId: number
  ordemServico: string | null
  problemaTipo: TipoProblema
  observacao?: string | null
  fotos: Blob[]
}) {
  if (!supabase) throw new Error('Supabase não configurado.')

  const caminhos = caminhosDasFotos(
    params.rotaId,
    params.hidranteId,
    params.ordemServico,
    params.fotos.length,
  )

  for (let indice = 0; indice < params.fotos.length; indice += 1) {
    const { error } = await supabase.storage
      .from('problemas-parada')
      .upload(caminhos[indice], params.fotos[indice], {
        contentType: 'image/jpeg',
        upsert: true,
      })
    if (error) throw error
  }

  const { error } = await supabase.rpc('reportar_problema', {
    p_rota_id: params.rotaId,
    p_hidrante_id: params.hidranteId,
    p_ordem_servico: params.ordemServico,
    p_tipo_problema: params.problemaTipo,
    p_observacao: params.observacao?.trim() || null,
    p_fotos: caminhos,
  })

  if (error) throw error
}

async function enviarParada(params: {
  rotaId: number
  hidranteId: number
  ordemServico: string | null
  status: ParadaStatus
}) {
  if (!supabase) throw new Error('Supabase não configurado.')

  const { error } = await supabase.rpc('marcar_parada', {
    p_rota_id: params.rotaId,
    p_hidrante_id: params.hidranteId,
    p_ordem_servico: params.ordemServico,
    p_status: params.status,
    p_observacao: null,
    p_lat: null,
    p_lng: null,
    p_concluido_em: null,
  })

  if (error) throw error
}

/** Envia todas as alterações pendentes. Devolve quantas foram aceitas. */
export async function sincronizarPendencias(): Promise<number> {
  if (!supabase || !navigator.onLine) return 0

  const pendentes = await db.paradasPendentes.orderBy('criadoEm').toArray()
  let enviadas = 0

  for (const pendente of pendentes) {
    try {
      if (
        pendente.status === 'nao_realizado' &&
        pendente.problemaTipo &&
        pendente.fotos &&
        pendente.fotos.length > 0
      ) {
        await enviarProblema({
          rotaId: pendente.rotaId,
          hidranteId: pendente.hidranteId,
          ordemServico: pendente.ordemServico,
          problemaTipo: pendente.problemaTipo,
          observacao: pendente.problemaObservacao,
          fotos: pendente.fotos,
        })
      } else {
        await enviarParada({
          rotaId: pendente.rotaId,
          hidranteId: pendente.hidranteId,
          ordemServico: pendente.ordemServico,
          status: pendente.status,
        })
      }

      if (pendente.key != null) {
        await db.paradasPendentes.delete(pendente.key)
      }
      enviadas += 1
    } catch {
      // Mantém na fila: provavelmente continua sem rede.
      break
    }
  }

  return enviadas
}

export async function contarPendencias(): Promise<number> {
  return db.paradasPendentes.count()
}

export async function listarPendencias(): Promise<ParadaPendente[]> {
  return db.paradasPendentes.orderBy('criadoEm').toArray()
}

/** Obtém a posição atual com timeout curto; nunca impede a conclusão. */
export function obterPosicao(): Promise<PosicaoAtual | null> {
  if (!('geolocation' in navigator)) return Promise.resolve(null)

  return new Promise((resolve) => {
    let resolvido = false
    const finalizar = (valor: PosicaoAtual | null) => {
      if (resolvido) return
      resolvido = true
      resolve(valor)
    }

    const timer = window.setTimeout(() => finalizar(null), 8000)

    navigator.geolocation.getCurrentPosition(
      (posicao) => {
        window.clearTimeout(timer)
        finalizar({
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
        })
      },
      () => {
        window.clearTimeout(timer)
        finalizar(null)
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 30000 },
    )
  })
}
