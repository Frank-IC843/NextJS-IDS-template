'use client';

import { useState } from 'react';
import { ChevronRightIcon, useTheme, responsive, InformationOutlineIcon } from '@instacart/ids-core';
import {
  ModalAutosize,
  ModalHeader,
  ModalTitle,
  ModalFooter,
  Text,
  SingleLineTextInput,
  SecondaryButton,
  Image,
  useModalState,
} from '@instacart/ids-customers';
import NextImage from 'next/image';

type Props = {
  modal: ReturnType<typeof useModalState>;
  onSubmit: (data: { name: string; description: string; retailerId: string | null; imageUrl?: string }) => void;
  onOpenRetailerSelect?: () => void;
  selectedRetailerName?: string;
  selectedRetailerLogoUrl?: string;
};

const COVER_IMAGES = [
  'https://www.instacart.com/image-server/224x/www.instacart.com/assets/business/order_guides/banners/og-image-1-4b7c9e03090091c30b739fc63a9b5816e344e58b2cbd28bdcf5617ad7a25cfda.png',
  'https://www.instacart.com/image-server/224x/www.instacart.com/assets/business/order_guides/banners/og-image-2-b6e57864e2ebe1b86c0bfa14afeadc5206c09f01fa4ab9d9b7871f3c7dd3dfac.png',
  'https://www.instacart.com/image-server/224x/www.instacart.com/assets/business/order_guides/banners/og-image-3-662e3e636de972c566d5c08299bd505950231ed1f8a7e9a1f8e2c0735171e653.png',
  'https://www.instacart.com/image-server/224x/www.instacart.com/assets/business/order_guides/banners/og-image-4-083f71357ff6b8f109358fee6a59511219da80d2d36e44d5f3055a89b0b85332.png',
  'https://www.instacart.com/image-server/224x/www.instacart.com/assets/business/order_guides/banners/og-image-5-ad07776aa003775ab1c316f3ef09740e1b9b82d3208a70450d99bc04922107e8.png',
  'https://www.instacart.com/image-server/224x/www.instacart.com/assets/business/order_guides/banners/og-image-6-e7c32f8b3cb6584bf2f4638432e54661bb2f836138e9a0429ff364fe48ec9beb.png',
  'https://www.instacart.com/image-server/224x/www.instacart.com/assets/business/order_guides/banners/og-image-7-032829676715419abed6585b5e9bed2cd1de6ee1bb484e740de43608fdf2d538.png',
  'https://www.instacart.com/image-server/224x/www.instacart.com/assets/business/order_guides/banners/og-image-8-c24e69fc89b3517174f8a529041481005d28cef5c16e9a58a0c1ad7d753cb9db.png',
  'https://www.instacart.com/image-server/224x/www.instacart.com/assets/business/order_guides/banners/og-image-9-88b91968cf82901e8ebd9e31b5433d8e231b174123d2350d8aa2701baeb0020c.png',
];

const STORE_PLACEHOLDER_URL =
  'https://www.instacart.com/image-server/48x48/www.instacart.com/assets/business/order_guides/retailer_icon_placeholder-63a3e2b01979f35da0e1870724fce461e1878cf4a1109d8d5e383d3ce715635c.png';

export function CreateOrderGuideModal({
  modal,
  onOpenRetailerSelect,
  onSubmit,
  selectedRetailerName,
  selectedRetailerLogoUrl,
}: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const theme = useTheme();

  const modalStyles = {
    modal: {
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '80vh',
      [responsive.up('r')]: { width: '552px' },
    },
  } as const;

  const styles = {
    section: {
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      borderRadius: theme.radius.r12,
      padding: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      background: theme.colors.systemGrayscale00,
    },
    sectionLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    sectionIcon: {
      width: 32,
      height: 32,
      borderRadius: 999,
      background: theme.colors.systemGrayscale10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    helper: {
      backgroundColor: theme.colors.systemGrayscale10,
      borderRadius: theme.radius.r8,
      padding: '12px 16px',
      display: 'flex',
      gap: '8px',
      alignItems: 'flex-start',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '12px',
    },
    coverItem: {
      borderRadius: theme.radius.r12,
      overflow: 'hidden',
      border: `1px solid ${theme.colors.systemGrayscale20}`,
      cursor: 'pointer',
    },
    divider: {
      marginTop: '16px',
      marginBottom: '8px',
      height: 1,
      background: theme.colors.systemGrayscale20,
    },
    content: {
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      overflowY: 'auto',
      flex: 1,
    },
  } as const;

  return (
    <ModalAutosize modal={modal} aria-label="Create Order Guide" styles={modalStyles}>
      <ModalHeader hide={modal.hide} accessibleLabels={{ close: 'Close create order guide' }}>
        <ModalTitle>Create Order Guide</ModalTitle>
      </ModalHeader>
      <div css={styles.content}>
        <div css={styles.section} onClick={onOpenRetailerSelect}>
          <div css={styles.sectionLeft}>
            <div css={styles.sectionIcon}>
              <NextImage src={STORE_PLACEHOLDER_URL} width={24} height={24} alt="Store" />
            </div>
            {selectedRetailerLogoUrl && (
              <Image
                templateUrl={selectedRetailerLogoUrl}
                alt={selectedRetailerName ?? 'Retailer'}
                width={32}
                height={32}
              />
            )}
            <div>
              <Text typography="subtitle">Choose a store (Required)</Text>
              <Text typography="bodyRegular" color="systemGrayscale60">
                This helps us check for available items.
              </Text>
            </div>
          </div>
          <ChevronRightIcon size="20px" />
        </div>

        <div css={styles.helper}>
          <InformationOutlineIcon size="24px" />
          <Text typography="bodyRegular" color="systemGrayscale70">
            Team members can only shop this order guide if the selected store is available in their area.
          </Text>
        </div>

        <SingleLineTextInput label="Title" value={name} onChange={e => setName(e.target.value)} />
        <SingleLineTextInput label="Description" value={description} onChange={e => setDescription(e.target.value)} />

        <div>
          <Text typography="bodyEmphasized" css={{ fontSize: '16px !important' }}>
            Add a cover photo to your order guide
          </Text>
          <div css={{ marginTop: '12px' }} />
          <div css={styles.grid}>
            {COVER_IMAGES.map(src => (
              <button key={src} css={styles.coverItem} type="button" onClick={() => setImageUrl(src)}>
                <NextImage src={src} alt="Cover" width={224} height={126} style={{ width: '100%', height: 'auto' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <ModalFooter>
        <SecondaryButton
          css={{ width: '100%' }}
          onClick={() => onSubmit({ name, description, retailerId: null, imageUrl })}
        >
          Next
        </SecondaryButton>
      </ModalFooter>
    </ModalAutosize>
  );
}

export default CreateOrderGuideModal;
