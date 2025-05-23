'use client';

import Welcome from '@/components/atoms/welcome';
import { GameModal } from '@/components/organisms/game-modal';
import { GameOptions } from '@/components/organisms/game-mode-selection';
import { WagerModal } from '@/components/organisms/WagerModal';
import { useModalStore } from '@/store/modal-store';

export default function Home() {
  const { openModal } = useModalStore();

  const handleGameSelect = (gameId: string) => {
    if (gameId === 'quick-game') {
      openModal('game');
    } else if (gameId === 'single-player') {
      openModal('single-wager');
    } else if (gameId === 'multi-player') {
      openModal('multi-wager');
    }
  };

  return (
    <main className="lg:max-w-[53rem] mt-4 mx-auto h-fit w-full mb-20 lg:mb-12 p-4 lg:p-0 md:mt-24 lg:mt-32">
      <Welcome />
      <GameOptions onSelectGame={handleGameSelect} />

      {/* Modals */}
      <GameModal />
      <WagerModal />
    </main>
  );
}
