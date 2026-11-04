const LADO_MAXIMO = 1600
const QUALIDADE = 0.7

/** Reduz a foto no aparelho antes de guardar ou enviar. */
export async function comprimirFoto(arquivo: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(arquivo)
  try {
    const escala = Math.min(1, LADO_MAXIMO / Math.max(bitmap.width, bitmap.height))
    const largura = Math.max(1, Math.round(bitmap.width * escala))
    const altura = Math.max(1, Math.round(bitmap.height * escala))
    const tela = document.createElement('canvas')
    tela.width = largura
    tela.height = altura
    const contexto = tela.getContext('2d')
    if (!contexto) throw new Error('Não foi possível preparar a foto.')
    contexto.drawImage(bitmap, 0, 0, largura, altura)

    const compactada = await new Promise<Blob | null>((resolver) => {
      tela.toBlob(resolver, 'image/jpeg', QUALIDADE)
    })
    if (!compactada) throw new Error('Não foi possível compactar a foto.')
    return compactada
  } finally {
    bitmap.close()
  }
}
