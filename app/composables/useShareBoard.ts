export function useShareBoard() {
  const shareableLink = ref('')
  const isGenerating = ref(false)
  const config = useRuntimeConfig()

  async function generateShareLink(words: string[], board: (string | null)[][]) {
    isGenerating.value = true
    shareableLink.value = ''

    try {
      const { id } = await $fetch('/api/boards', {
        method: 'POST',
        body: { words, board }
      })

      shareableLink.value = `${config.public.siteUrl}/?id=${id}`
      return shareableLink.value
    } catch (error) {
      console.error('Failed to generate share link:', error)
      throw error
    } finally {
      isGenerating.value = false
    }
  }

  async function copyToClipboard() {
    if (!shareableLink.value) return

    try {
      await navigator.clipboard.writeText(shareableLink.value)
      return true
    } catch (error) {
      console.error('Failed to copy:', error)
      return false
    }
  }

  return {
    shareableLink,
    isGenerating,
    generateShareLink,
    copyToClipboard,
  }
}
