const lubaThemeConfig = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      colors: {
        luba: {
          navy: '#102D4F',
          navyActive: '#1E3959',
          navyMuted: '#2E4765',
          sidebarText: '#CFD9E5',
          sidebarNav: '#C3D0DF',
          sidebarMuted: '#8FA3BA',
          sidebarIcon: '#9FB2C8',
          canvas: '#F3F6FA',
          surface: '#FFFFFF',
          surfaceMuted: '#EEF3F8',
          tableHeader: '#EDF2F7',
          border: '#DCE4EE',
          borderStrong: '#CED5DD',
          controlTrack: '#E2E8F0',
          textPrimary: '#0F2742',
          textSecondary: '#32475D',
          textMuted: '#506274',
          textSubtle: '#607287',
          authMuted: '#6E8098',
          authLabel: '#4A5D75',
          cta: '#D95820',
          ctaHover: '#C04B17',
          ctaTint: '#FFF5EF',
          info: '#225A91',
          infoText: '#1C4E80',
          infoBg: '#EAF2FB',
          infoPillBg: '#E8F1FB',
          infoBorder: '#C9DDF3',
          warningText: '#9A6300',
          warningBg: '#FDF3DC',
          warningBorder: '#F3D599',
          success: '#197653',
          successBg: '#E5F5ED',
          successBorder: '#B7E2CC',
          danger: '#B93838',
          dangerHover: '#9E2E2E',
          dangerBg: '#FCEAEA',
          dangerBorder: '#F3C0C0',
          neutralBg: '#EAEEF4',
          neutralText: '#47586E',
          mapBg: '#E9F0EA',
          mapPark1: '#DCE7DC',
          mapPark2: '#D3E3D4',
          mapCorridor: '#D9B88F',
          mapCluster: '#8FB3D9'
        }
      },
      spacing: {
        sidebar: '236px',
        topbar: '80px'
      },
      borderRadius: {
        card: '12px',
        loginCard: '14px',
        banner: '10px',
        modal: '16px',
        control: '8px'
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(16, 45, 79, 0.04)',
        modal: '0 20px 45px -10px rgba(16, 45, 79, 0.28)'
      }
    }
  }
};

window.LUBA_TAILWIND_CONFIG = lubaThemeConfig;
if (typeof window.tailwind !== 'undefined') {
  window.tailwind.config = lubaThemeConfig;
}
