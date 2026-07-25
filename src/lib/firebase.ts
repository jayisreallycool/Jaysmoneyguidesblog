import { initializeApp, getApps, getApp } from 'firebase/app';
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
    filename: 'affiliate-viable-solution-infographic.webp',
    url: '/images/affiliate-viable-solution-infographic.webp',
    category: 'Infographics',
    altText: 'Infographic illustrating why affiliate marketing is a viable passive income solution with low cost entry and work from anywhere perks',
    description: 'High-converting visual breakdown featuring key pillars: Passive Income, Growing Industry, Low Cost Entry, and Work from Anywhere.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'img-affiliate-opportunity-2025',
    title: 'Affiliate Marketing Still a Big Opportunity in 2025!',
    filename: 'affiliate-opportunity-2025-infographic.webp',
    url: '/images/affiliate-opportunity-2025-infographic.webp',
    category: 'Infographics',
    altText: 'Infographic showcasing 2025 affiliate marketing opportunities with flexible lifestyle and booming e-commerce growth',
    description: 'Updated 2025 strategic blueprint infographic highlighting booming e-commerce, low startup costs, and flexible lifestyle benefits.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'img-guide-cover',
    title: 'JaysMoneyGuides Affiliate Marketing For Beginners Cover',
    filename: 'affiliate-marketing-guide-cover.webp',
    url: '/images/affiliate-marketing-guide-cover.webp',
    category: 'eBook & Master Guides',
    altText: 'JaysMoneyGuides Affiliate Marketing For Beginners eBook artwork by Jay Lopez',
    description: 'Official 3D book cover art for Jay Lopez\'s flagship beginner blueprint ebook on building passive income.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'img-mascot-logo',
    title: 'JaysMoneyGuides Mascot Logo',
    filename: 'jays-mascot-logo.webp',
    url: '/images/jays-mascot-logo.webp',
    category: 'Brand Assets',
    altText: 'JaysMoneyGuides Mascot Logo showing Jay with cash giving a thumbs up',
    description: 'Official brand mascot logo with cash in hand and thumbs up, isolated on clean background.',
    createdAt: new Date().toISOString()
  },
  {
    id: 'img-hero-banner',
    title: 'JaysMoneyGuides Hero Wallpaper Banner',
    filename: 'jays-hero-banner.webp',
    url: '/images/jays-hero-banner.webp',
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
      console.log('Seeding initial media assets into Firestore database...');
      for (const asset of INITIAL_MEDIA_ASSETS) {
        await setDoc(doc(db, 'media_assets', asset.id), asset);
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
    console.error('Error seeding/fetching media assets from Firestore:', err);
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
    console.error('Error getting media assets:', err);
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
    console.error('Error saving media asset to Firestore:', err);
  }
}

/**
 * Delete a media asset from Firestore
 */
export async function deleteMediaAssetFromDB(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'media_assets', id));
  } catch (err) {
    console.error('Error deleting media asset from Firestore:', err);
  }
}
