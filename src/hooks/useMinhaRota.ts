import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  carregarMinhasRotas,
  listarPendencias,
  marcarParada,
  sincronizarPendencias,
} from '../services/rotasService'
import type { TipoProblema } from '../lib/problemas'
import type { MinhaRota, ParadaPendente, ParadaStatus } from '../lib/rotaTypes'

/** Parada de hoje, na ordem da rota, para o marcador numerado do mapa. */
export interface HidranteDoDia {
  hidranteId: number
  latitude: number
  longitude: number
  endereco: string | null
  ativo: string | null
  bairro: string | null
  distrito: string | null
  subprefeitura: string | null
  tipo: string | null
  /** Posição na rota, começando em 1, como no mapa do painel. */
  numero: number
  status: ParadaStatus
  paradaKey: string
  rotaId: number
  ordemServico: string | null
}

export type MarcarParadaArgs = {
  paradaKey: string
  rotaId: number
  hidranteId: number
  ordemServico: string | null
  status: ParadaStatus
  problemaTipo?: TipoProblema
  fotos?: Blob[]
}

function dataLocalHoje(): string {
  const hoje = new Date()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${hoje.getFullYear()}-${mes}-${dia}`
}

function dataDaRota(valor: string | null): string | null {
  if (!valor) return null
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(valor)
  return match?.[1] ?? null
}

/** Paradas das rotas de hoje, numeradas na ordem da lista de cada rota. */
export function extrairHidrantesDoDia(rotas: MinhaRota[]): HidranteDoDia[] {
  const hoje = dataLocalHoje()
  const servicos: HidranteDoDia[] = []

  for (const item of rotas) {
    if (dataDaRota(item.rota.data) !== hoje) continue

    const paradas = item.paradas.slice().sort(
      (a, b) =>
        a.created_at.localeCompare(b.created_at) ||
        a.hidrante_id - b.hidrante_id ||
        a.ordem_servico_key.localeCompare(b.ordem_servico_key),
    )

    paradas.forEach((parada, indice) => {
      servicos.push({
        hidranteId: parada.hidrante_id,
        latitude: parada.latitude,
        longitude: parada.longitude,
        endereco: parada.endereco,
        ativo: parada.ativo,
        bairro: parada.bairro,
        distrito: parada.distrito,
        subprefeitura: parada.subprefeitura,
        tipo: parada.tipo,
        numero: indice + 1,
        status: parada.status,
        paradaKey: parada.paradaKey,
        rotaId: parada.rota_id,
        ordemServico: parada.ordem_servico,
      })
    })
  }

  return servicos
}

export function useMinhaRota(usuarioId: string | null | undefined) {
  const [rotas, setRotas] = useState<MinhaRota[]>([])
  const [carregando, setCarregando] = useState(true)
  const [online, setOnline] = useState(navigator.onLine)
  const [pendencias, setPendencias] = useState<ParadaPendente[]>([])
  const [erro, setErro] = useState('')

  const atualizarPendentes = useCallback(async () => {
    setPendencias(await listarPendencias())
  }, [])

  const atualizar = useCallback(
    async (sincronizar = false) => {
      if (!usuarioId) {
        setRotas([])
        setCarregando(false)
        return
      }

      setCarregando(true)
      setErro('')

      try {
        if (sincronizar) await sincronizarPendencias()

        const resultado = await carregarMinhasRotas(usuarioId)
        setRotas(resultado.rotas)
        setOnline(resultado.online)
        await atualizarPendentes()
      } catch (e) {
        setErro(e instanceof Error ? e.message : 'Erro ao carregar as rotas.')
      } finally {
        setCarregando(false)
      }
    },
    [usuarioId, atualizarPendentes],
  )

  useEffect(() => {
    void atualizar(true)
  }, [atualizar])

  useEffect(() => {
    const aoVoltarRede = () => {
      setOnline(true)
      void atualizar(true)
    }
    const aoPerderRede = () => setOnline(false)

    window.addEventListener('online', aoVoltarRede)
    window.addEventListener('offline', aoPerderRede)

    return () => {
      window.removeEventListener('online', aoVoltarRede)
      window.removeEventListener('offline', aoPerderRede)
    }
  }, [atualizar])

  const marcar = useCallback(
    async (params: MarcarParadaArgs) => {
      const resultado = await marcarParada(params)

      if (usuarioId) {
        const { rotas: atualizadas } = await carregarMinhasRotas(usuarioId)
        setRotas(atualizadas)
      }
      await atualizarPendentes()

      return resultado
    },
    [usuarioId, atualizarPendentes],
  )

  const hidrantesDoDia = useMemo(() => extrairHidrantesDoDia(rotas), [rotas])

  return {
    rotas,
    carregando,
    online,
    pendencias,
    pendentes: pendencias.length,
    erro,
    hidrantesDoDia,
    atualizar,
    marcar,
    atualizarPendentes,
  }
}