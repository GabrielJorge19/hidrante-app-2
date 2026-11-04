import { useEffect, useState } from 'react'
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
  const [fotos, setFotos] = useState<FotoEscolhida[]>([])
  const [aviso, setAviso] = useState('')
  const [falha, setFalha] = useState('')

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
        ordemServico: servico.ordemServico,
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
        ordemServico: servico.ordemServico,
        status: 'nao_realizado',
        problemaTipo: tipoProblema,
        fotos: fotos.map((foto) => foto.blob),
      })
      soltarFotos(fotos)
      setFotos([])
      setTipoProblema('')
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
  const local = [hidrante?.bairro, hidrante?.distrito].filter(Boolean).join(' · ')
  const opcoes = problemasDoTipo(hidrante?.tipo)
  const podeReportar = tipoProblema !== '' && fotos.length >= 1 && fotos.length <= 3

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      compact
      title={servico ? `Manutenção ${servico.numero}` : ''}
      titleAriaLabel={
        servico ? `Manutenção ${servico.numero}` : undefined
      }
    >
      {servico && hidrante && (
        <div className="hydrant-summary">
          <p className="minha-rota-endereco">
            {hidrante.endereco || 'Sem endereço cadastrado'}
          </p>
          <p className="minha-rota-meta">
            Hidrante #{hidrante.id}
            {hidrante.ativo ? ` · ativo ${hidrante.ativo}` : ''}
          </p>
          {local && <p className="minha-rota-meta">{local}</p>}
          {servico.ordemServico && (
            <p className="minha-rota-meta">OS {servico.ordemServico}</p>
          )}
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
            <button
              type="button"
              className="sheet-button wide"
              onClick={() => void irPara()}
              disabled={processando}
            >
              Ir para
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
