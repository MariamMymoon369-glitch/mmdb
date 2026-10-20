import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    star: string;
    border: string;
  }

  interface PaletteOptions {
    star?: string;
    border?: string;
  }
}
