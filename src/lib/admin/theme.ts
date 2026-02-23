import { defaultTheme } from 'react-admin';
import { createTheme } from '@mui/material/styles';

const baseTheme = defaultTheme;

// Bright light theme — white + green, matching the Baxtli Men logo
export const lightGreenTheme = createTheme({
    ...baseTheme,
    palette: {
        mode: 'light',
        primary: {
            main: '#114539',   // Dark green from logo
            light: '#1a6b56',
            dark: '#0b2e26',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#0a8069',   // Medium green accent
            light: '#14b395',
            dark: '#064d3f',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f5f7f5', // Very light green-tinted white
            paper: '#ffffff',
        },
        text: {
            primary: '#1a2e1a',   // Dark greenish black
            secondary: '#5a6b5a', // Muted green-gray
        },
        divider: 'rgba(17, 69, 57, 0.08)',
        error: {
            main: '#dc2626',
        },
        warning: {
            main: '#d97706',
        },
        info: {
            main: '#2563eb',
        },
        success: {
            main: '#16a34a',
        },
    },
    typography: {
        fontFamily: 'var(--font-inter), "Inter", sans-serif',
        h1: { fontFamily: 'var(--font-spectral), "Spectral", serif', fontWeight: 800, color: '#114539' },
        h2: { fontFamily: 'var(--font-spectral), "Spectral", serif', fontWeight: 800, color: '#114539' },
        h3: { fontFamily: 'var(--font-spectral), "Spectral", serif', fontWeight: 800, color: '#114539' },
        h4: { fontFamily: 'var(--font-inter), "Inter", sans-serif', fontWeight: 700 },
        h5: { fontFamily: 'var(--font-inter), "Inter", sans-serif', fontWeight: 700 },
        h6: { fontFamily: 'var(--font-inter), "Inter", sans-serif', fontWeight: 700, fontSize: '0.875rem' },
        button: { textTransform: 'none', fontWeight: 700, letterSpacing: '0.025em' },
    },
    shape: {
        borderRadius: 14,
    },
    components: {
        ...baseTheme.components,
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    color: '#114539',
                    boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
                    borderBottom: '1px solid rgba(17, 69, 57, 0.08)',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid rgba(17, 69, 57, 0.08)',
                    '& .RaMenuItemLink-active': {
                        backgroundColor: 'rgba(17, 69, 57, 0.06)',
                        color: '#114539',
                        fontWeight: 700,
                        borderRadius: 10,
                    },
                    '& .MuiListItemIcon-root': {
                        color: '#5a6b5a',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06), 0 1px 2px rgba(17, 69, 57, 0.04)',
                },
                elevation1: {
                    boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '8px 16px',
                },
                containedPrimary: {
                    backgroundColor: '#114539',
                    boxShadow: '0 4px 14px rgba(17, 69, 57, 0.2)',
                    '&:hover': {
                        backgroundColor: '#1a6b56',
                        boxShadow: '0 6px 20px rgba(17, 69, 57, 0.15)',
                        transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(17, 69, 57, 0.06)',
                    padding: '14px 16px',
                },
                head: {
                    fontWeight: 700,
                    color: '#5a6b5a',
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                    letterSpacing: '0.05em',
                    backgroundColor: '#f8faf8',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    backgroundColor: '#fdfefd',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(17, 69, 57, 0.3)',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#114539',
                        borderWidth: '2px',
                    },
                },
                notchedOutline: {
                    borderColor: 'rgba(17, 69, 57, 0.15)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px rgba(17, 69, 57, 0.06), 0 1px 2px rgba(17, 69, 57, 0.04)',
                    border: '1px solid rgba(17, 69, 57, 0.06)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    fontWeight: 600,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    '&.Mui-selected': {
                        color: '#114539',
                    },
                },
            },
        },
    },
});

// Keep backward-compat export name
export const darkLuxuryTheme = lightGreenTheme;
