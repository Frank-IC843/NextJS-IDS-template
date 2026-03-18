'use client';

import {
  DetrimentalButtonSmall,
  ModalAutosize,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  SecondaryButtonSmall,
  Text,
  useModalState,
} from '@instacart/ids-customers';
import { useEffect } from 'react';

interface DashboardConfirmModalProps {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function DashboardConfirmModal({
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: DashboardConfirmModalProps) {
  const modal = useModalState({ visible: true });
  const accessibleLabels = { close: 'Close confirmation dialog' };

  useEffect(() => {
    if (!modal.visible) {
      onClose();
    }
  }, [modal.visible, onClose]);

  return (
    <ModalAutosize modal={modal} isMounted hideOnClickOutside hideOnEsc>
      <ModalHeader hide={modal.hide} accessibleLabels={accessibleLabels} onClick={modal.hide}>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <div css={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px 0 6px' }}>
          <Text typography="bodyRegular" color="systemGrayscale60">
            {description}
          </Text>
        </div>
      </ModalContent>
      <ModalFooter>
        <div css={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'stretch' }}>
          <DetrimentalButtonSmall onClick={onConfirm} fullWidth>
            {confirmLabel}
          </DetrimentalButtonSmall>
          <SecondaryButtonSmall onClick={modal.hide} fullWidth>
            Cancel
          </SecondaryButtonSmall>
        </div>
      </ModalFooter>
    </ModalAutosize>
  );
}
