/**
 * Helper to smoothly scroll the next card into the exact viewport position
 * of the currently clicked card element.
 */
export const scrollToNextCard = (currentCardElement: HTMLElement | null) => {
    if (!currentCardElement) return;

    // Find the nearest scrollable container
    let scrollContainer: HTMLElement | null = currentCardElement.closest('main');
    if (!scrollContainer) {
        scrollContainer = currentCardElement.closest('.overflow-y-auto') || document.documentElement;
    }
    if (!scrollContainer) return;

    const cardSelector = '[data-card-item="true"]';
    const allCards = Array.from(scrollContainer.querySelectorAll(cardSelector)) as HTMLElement[];
    const currentIndex = allCards.indexOf(currentCardElement);

    if (currentIndex !== -1 && currentIndex < allCards.length - 1) {
        const nextCard = allCards[currentIndex + 1];
        if (nextCard) {
            const currentRect = currentCardElement.getBoundingClientRect();
            const nextRect = nextCard.getBoundingClientRect();
            const delta = nextRect.top - currentRect.top;

            scrollContainer.scrollBy({
                top: delta,
                behavior: 'smooth'
            });
        }
    }
};
