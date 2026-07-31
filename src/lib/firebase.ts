import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with custom database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
  };
  console.warn(`[Firestore ${operationType}] ${path}: ${errMsg}`);
  return errInfo;
}

export interface MediaAsset {
  id: string;
  title: string;
  filename: string;
  url: string;
  category: 'Infographics' | 'eBook & Master Guides' | 'Brand Assets' | 'Other';
  altText: string;
  description: string;
  createdAt: string;
  width?: number;
  height?: number;
}

// Initial images uploaded by the user to be seeded into Firestore
export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  {
    id: 'img-affiliate-viable-solution',
    title: 'Affiliate Marketing is Still a Viable Solution',
    filename: 'affiliate-marketing-viable-business-infographic.jpg',
    url: '/images/affiliate-marketing-viable-business-infographic.webp',
    category: 'Infographics',
    altText: 'Infographic illustrating why affiliate marketing is a viable passive income solution with low cost entry and work from anywhere perks',
    description: 'High-converting visual breakdown featuring key pillars: Passive Income, Growing Industry, Low Cost Entry, and Work from Anywhere.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'img-affiliate-opportunity-2025',
    title: 'Affiliate Marketing Still a Big Opportunity in 2025!',
    filename: 'affiliate-marketing-2025-opportunity-infographic.jpg',
    url: '/images/affiliate-marketing-2025-opportunity-infographic.webp',
    category: 'Infographics',
    altText: 'Infographic showcasing 2025 affiliate marketing opportunities with flexible lifestyle and booming e-commerce growth',
    description: 'Updated 2025 strategic blueprint infographic highlighting booming e-commerce, low startup costs, and flexible lifestyle benefits.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'img-guide-cover',
    title: 'JaysMoneyGuides Affiliate Marketing For Beginners Cover',
    filename: 'affiliate-marketing-guide-cover.jpg',
    url: '/images/affiliate-marketing-guide-cover.webp',
    category: 'eBook & Master Guides',
    altText: 'JaysMoneyGuides Affiliate Marketing For Beginners eBook artwork by Jay Lopez',
    description: 'Official 3D book cover art for Jay Lopez\'s flagship beginner blueprint ebook on building passive income.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'img-mascot-logo',
    title: 'JaysMoneyGuides Mascot Logo',
    filename: 'jaysmoneyguides-logo.jpg',
    url: '/images/jaysmoneyguides-logo.webp',
    category: 'Brand Assets',
    altText: 'JaysMoneyGuides Mascot Logo showing Jay with cash giving a thumbs up',
    description: 'Official brand mascot logo with cash in hand and thumbs up, isolated on clean background.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'img-hero-banner',
    title: 'JaysMoneyGuides Hero Wallpaper Banner',
    filename: 'jaysmoneyguides-hero-banner.jpg',
    url: '/images/jaysmoneyguides-hero-banner.webp',
    category: 'Brand Assets',
    altText: 'JaysMoneyGuides hero banner graphic with money stacks and green backdrop',
    description: 'Full-bleed green gradient hero banner artwork for website headers and social media banners.',
    createdAt: new Date().toISOString()
  }
];

/**
 * Ensures initial images are seeded into the Firestore database
 */
export async function seedInitialMediaAssets(): Promise<MediaAsset[]> {
  try {
    const assetsRef = collection(db, 'media_assets');
    const snapshot = await getDocs(assetsRef);

    if (snapshot.empty) {
      if (auth.currentUser) {
        console.log('Seeding initial media assets into Firestore database...');
        for (const asset of INITIAL_MEDIA_ASSETS) {
          try {
            await setDoc(doc(db, 'media_assets', asset.id), asset);
          } catch {
            // Ignore write permission error if user is not admin
          }
        }
      }
      return INITIAL_MEDIA_ASSETS;
    } else {
      const existingAssets: MediaAsset[] = [];
      snapshot.forEach((doc) => {
        existingAssets.push(doc.data() as MediaAsset);
      });
      return existingAssets;
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'media_assets');
    return INITIAL_MEDIA_ASSETS;
  }
}

/**
 * Get all media assets from Firestore
 */
export async function getMediaAssetsFromDB(): Promise<MediaAsset[]> {
  try {
    const assetsRef = collection(db, 'media_assets');
    const snapshot = await getDocs(assetsRef);
    if (snapshot.empty) {
      return await seedInitialMediaAssets();
    }
    const list: MediaAsset[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as MediaAsset);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'media_assets');
    return INITIAL_MEDIA_ASSETS;
  }
}

/**
 * Add or update a media asset in Firestore
 */
export async function saveMediaAssetToDB(asset: MediaAsset): Promise<void> {
  try {
    await setDoc(doc(db, 'media_assets', asset.id), asset);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `media_assets/${asset.id}`);
  }
}

/**
 * Delete a media asset from Firestore
 */
export async function deleteMediaAssetFromDB(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'media_assets', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `media_assets/${id}`);
  }
}
