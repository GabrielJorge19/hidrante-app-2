import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import BottomSheet from '../ui/BottomSheet'
import { comprimirFoto } from '../../lib/comprimirFoto'
import { openInNavigator } from '../../lib/maps'
import { problemasDoTipo, ROTULO_PROBLEMA, type TipoProblema } from '../../lib/problemas'
import { ROTULO_PARADA_STATUS } from '../../lib/rotaTypes'
import type { MarcadorServico } from '../map/HydrantLayer'
import type { MarcarParadaArgs } from '../../hooks/useMinhaRota'
import '../hydrant/hydrant-ui.css'
import './minha-rota.css'

interface ServicoSheetProps {
  open: boolean
  servico: MarcadorServico | null
  pendente: boolean
  onClose: () => void
  marcar: (params: MarcarParadaArgs) => Promise<{ enviado: boolean }>
}

interface FotoEscolhida {
  url: string
  blob: Blob
}

/** Altura máxima do campo de observação antes de começar a rolar. */
const ALTURA_MAXIMA_OBSERVACAO = 120

function bombeirosUrl(id: number): string {
  return `https://cbaplang.corpodebombeiros.sp.gov.br/hidrantes/03individual/${id}.html`
}

export default function ServicoSheet({
  open,
  servico,
  pendente,
  onClose,
  marcar,
}: ServicoSheetProps) {
  const [processando, setProcessando] = useState(false)
  const [confirmando, setConfirmando] = useState<'concluido' | 'problema' | null>(null)
  const [tipoProblema, setTipoProblema] = useState<TipoProblema | ''>('')
  const [observacao, setObservacao] = useState('')
  const [fotos, setFotos] = useState<FotoEscolhida[]>([])
  const [aviso, setAviso] = useState('')
  const [falha, setFalha] = useState('')
  const observacaoRef = useRef<HTMLTextAreaElement>(null)

  // Cresce conforme as linhas digitadas, sem estourar o espaço do formulário.
  useLayoutEffect(() => {
    const campo = observacaoRef.current
    if (!campo) return
    campo.style.height = 'auto'
    const excedeu = campo.scrollHeight > ALTURA_MAXIMA_OBSERVACAO
    campo.style.height = `${Math.min(campo.scrollHeight, ALTURA_MAXIMA_OBSERVACAO)}px`
    campo.style.overflowY = excedeu ? 'auto' : 'hidden'
  }, [observacao, confirmando])

  useEffect(() => {
    if (!aviso) return
    const timer = window.setTimeout(() => setAviso(''), 5000)
    return () => window.clearTimeout(timer)
  }, [aviso])

  function soltarFotos(lista: FotoEscolhida[]) {
    for (const foto of lista) URL.revokeObjectURL(foto.url)
  }

  function fecharConfirmacao() {
    soltarFotos(fotos)
    setFotos([])
    setTipoProblema('')
    setObservacao('')
    setConfirmando(null)
  }

  async function atualizarStatus(status: 'concluido' | 'em_andamento') {
    if (!servico) return false
    setProcessando(true)
    setFalha('')

    try {
      const { enviado } = await marcar({
        paradaKey: servico.paradaKey,
        rotaId: servico.rotaId,
        hidranteId: servico.hidrante.id,
        status,
      })
      setConfirmando(null)
      setAviso(
        enviado
          ? 'Parada atualizada.'
          : 'Salvo no aparelho. Será enviado quando a internet voltar.',
      )
      return true
    } catch (e) {
      setFalha(
        e instanceof Error ? e.message : 'Não foi possível atualizar a parada.',
      )
      return false
    } finally {
      setProcessando(false)
    }
  }

  async function reportar() {
    if (!servico || !tipoProblema || fotos.length < 1) return
    setProcessando(true)
    setFalha('')

    try {
      const { enviado } = await marcar({
        paradaKey: servico.paradaKey,
        rotaId: servico.rotaId,
        hidranteId: servico.hidrante.id,
        status: 'nao_realizado',
        problemaTipo: tipoProblema,
        observacao: observacao.trim() || undefined,
        fotos: fotos.map((foto) => foto.blob),
      })
      soltarFotos(fotos)
      setFotos([])
      setTipoProblema('')
      setObservacao('')
      setConfirmando(null)
      setAviso(
        enviado
          ? 'Problema reportado.'
          : 'Salvo no aparelho. Será enviado quando a internet voltar.',
      )
    } catch (e) {
      setFalha(
        e instanceof Error ? e.message : 'Não foi possível reportar o problema.',
      )
    } finally {
      setProcessando(false)
    }
  }

  async function adicionarFotos(lista: FileList | null) {
    if (!lista) return
    const restantes = 3 - fotos.length
    const escolhidas = [...lista].slice(0, restantes)
    setFalha('')
    try {
      const novas: FotoEscolhida[] = []
      for (const arquivo of escolhidas) {
        const blob = await comprimirFoto(arquivo)
        novas.push({ url: URL.createObjectURL(blob), blob })
      }
      setFotos((atuais) => [...atuais, ...novas].slice(0, 3))
    } catch (e) {
      setFalha(e instanceof Error ? e.message : 'Não foi possível ler a foto.')
    }
  }

  function removerFoto(indice: number) {
    setFotos((atuais) => {
      const alvo = atuais[indice]
      if (alvo) URL.revokeObjectURL(alvo.url)
      return atuais.filter((_, posicao) => posicao !== indice)
    })
  }

  async function irPara() {
    if (!servico || !hidrante) return
    if (servico.status === 'pendente') {
      const ok = await atualizarStatus('em_andamento')
      if (!ok) return
    }
    openInNavigator(hidrante.latitude, hidrante.longitude)
  }

  const hidrante = servico?.hidrante
  const opcoes = problemasDoTipo(hidrante?.tipo)
  const podeReportar = tipoProblema !== '' && fotos.length >= 1 && fotos.length <= 3

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      compact
      title={servico ? String(servico.hidrante.id) : ''}
      titleAriaLabel={
        servico ? `Hidrante ${servico.hidrante.id}` : undefined
      }
    >
      {servico && hidrante && (
        <div className="hydrant-summary">
          <p className="minha-rota-meta">
            Subprefeitura: {hidrante.subprefeitura || '—'}
          </p>
          {servico.ordensServico.length > 0 &&
            servico.ordensServico.map((ordem) => (
              <p key={ordem.ordem_servico} className="minha-rota-meta">
                OS {ordem.ordem_servico} · {ordem.status}
              </p>
            ))}
          <p className="minha-rota-meta">
            Situação: {ROTULO_PARADA_STATUS[servico.status]}
          </p>

          {pendente && (
            <p className="minha-rota-pendente">Aguardando envio</p>
          )}
          {aviso && <p className="minha-rota-aviso">{aviso}</p>}
          {falha && <p className="minha-rota-erro">{falha}</p>}

          <div className="sheet-actions">
            {(servico.status === 'pendente' || servico.status === 'em_andamento') &&
              (confirmando === 'concluido' ? (
                <>
                  <p className="minha-rota-pergunta">Concluir esta manutenção?</p>
                  <button
                    type="button"
                    className="sheet-button primary"
                    onClick={() => void atualizarStatus('concluido')}
                    disabled={processando}
                  >
                    {processando ? 'Salvando...' : 'Confirmar'}
                  </button>
                  <button
                    type="button"
                    className="sheet-button"
                    onClick={fecharConfirmacao}
                    disabled={processando}
                  >
                    Voltar
                  </button>
                </>
              ) : confirmando === 'problema' ? (
                <div className="problema-form">
                  <label className="minha-rota-pergunta" htmlFor="tipo-problema">
                    Qual é o problema?
                  </label>
                  <select
                    id="tipo-problema"
                    className="problema-select"
                    value={tipoProblema}
                    onChange={(evento) =>
                      setTipoProblema(evento.target.value as TipoProblema | '')
                    }
                    disabled={processando}
                  >
                    <option value="">Selecione</option>
                    {opcoes.map((opcao) => (
                      <option key={opcao} value={opcao}>
                        {ROTULO_PROBLEMA[opcao]}
                      </option>
                    ))}
                  </select>
                  <textarea
                    ref={observacaoRef}
                    className="problema-observacao"
                    value={observacao}
                    onChange={(evento) => setObservacao(evento.target.value)}
                    placeholder="Observação (opcional)"
                    aria-label="Observação (opcional)"
                    rows={1}
                    maxLength={500}
                    disabled={processando}
                  />
                  {fotos.length > 0 && (
                    <div className="problema-fotos">
                      {fotos.map((foto, indice) => (
                        <div className="problema-foto" key={foto.url}>
                          <img src={foto.url} alt={`Foto ${indice + 1}`} />
                          <button
                            type="button"
                            className="problema-remover"
                            aria-label={`Remover foto ${indice + 1}`}
                            onClick={() => removerFoto(indice)}
                            disabled={processando}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {fotos.length < 3 && (
                    <label className="problema-arquivo">
                      {fotos.length === 0 ? 'Adicionar foto' : 'Adicionar outra foto'}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        disabled={processando}
                        onChange={(evento) => {
                          void adicionarFotos(evento.target.files)
                          evento.target.value = ''
                        }}
                      />
                    </label>
                  )}
                  <div className="minha-rota-acoes">
                    <button
                      type="button"
                      className="sheet-button primary"
                      onClick={() => void reportar()}
                      disabled={processando || !podeReportar}
                    >
                      {processando ? 'Salvando...' : 'Confirmar'}
                    </button>
                    <button
                      type="button"
                      className="sheet-button"
                      onClick={fecharConfirmacao}
                      disabled={processando}
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="sheet-button primary"
                    onClick={() => setConfirmando('concluido')}
                    disabled={processando}
                  >
                    Concluir
                  </button>
                  <button
                    type="button"
                    className="sheet-button"
                    onClick={() => setConfirmando('problema')}
                    disabled={processando}
                  >
                    Reportar problema
                  </button>
                </>
              ))}
            <div className="parada-navegacao">
              <a
                className="sheet-button"
                href={bombeirosUrl(hidrante.id)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 4h6v6" />
                  <path d="M20 4L10 14" />
                  <path d="M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5" />
                </svg>
                Ficha Bombeiros
              </a>
              <button
                type="button"
                className="sheet-button"
                onClick={() => void irPara()}
                disabled={processando}
              >
                Ir para
              </button>
            </div>
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
