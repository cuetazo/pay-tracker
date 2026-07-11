import 'react-native-gesture-handler/jestSetup';

global.IS_REACT_ACT_ENVIRONMENT = true;
jest.setTimeout(30000);

// Mock Reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock Google Sign In
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({
      user: { id: 'test-id', email: 'test@example.com', name: 'Test User' },
    }),
    signOut: jest.fn().mockResolvedValue(null),
    signInSilently: jest.fn().mockResolvedValue({
      user: { id: 'test-id', email: 'test@example.com', name: 'Test User' },
    }),
  },
  statusCodes: {
    SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
    IN_PROGRESS: 'IN_PROGRESS',
    PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
  },
}));

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(null),
  getItem: jest.fn().mockReturnValue(null),
  setItem: jest.fn().mockReturnValue(null),
}));

// Mock Supabase Client
jest.mock('@supabase/supabase-js', () => {
  const mockSupabase = {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signInWithIdToken: jest.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  };
  return {
    createClient: () => mockSupabase,
  };
});

// Mock Supabase Store instance in the app
jest.mock('@/stores/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
    },
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  },
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: (callback) => { require('react').useEffect(callback, []); },
  useNavigation: () => ({
    setOptions: jest.fn(),
  }),
  Link: 'Link',
}));

// Mock custom Native Module YapeTracker
jest.mock('../../modules/yape-tracker/src', () => ({
  setSession: jest.fn(),
  default: {
    setSession: jest.fn(),
  },
}), { virtual: true });

// Mock Vector Icons
jest.mock('@expo/vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');
jest.mock('@expo/vector-icons/Entypo', () => 'Entypo');
jest.mock('@expo/vector-icons/AntDesign', () => 'AntDesign');
jest.mock('@expo/vector-icons/Ionicons', () => 'Ionicons');
jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesome');
jest.mock('@expo/vector-icons/Feather', () => 'Feather');

// Mock expo-image
jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    Image: View,
  };
});

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {},
  },
  manifest: {},
}));

// Mock expo-font
jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
  loadAsync: jest.fn().mockResolvedValue(true),
}));

// Mock expo-device
jest.mock('expo-device', () => ({
  modelName: 'Mock Device',
}));
