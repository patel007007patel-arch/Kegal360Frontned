// Util Imports
import { menuClasses, verticalNavClasses } from '@menu/utils/menuClasses'

const navigationCustomStyles = (verticalNavOptions, theme) => {
  // Vars
  const { isCollapsed, isHovered, collapsedWidth, transitionDuration } = verticalNavOptions
  const collapsedHovered = isCollapsed && isHovered
  const collapsedNotHovered = isCollapsed && !isHovered

  return {
    color: 'var(--mui-palette-text-primary)',
    zIndex: 'var(--drawer-z-index) !important',
    [`& .${verticalNavClasses.header}`]: {
      minHeight: 64,
      paddingBlock: 20,
      paddingInline: theme.spacing(3, 2.5),
      ...(collapsedNotHovered && {
        paddingInline: theme.spacing((collapsedWidth - 42) / 8),
        '& a': {
          transform: `translateX(-${22 - (collapsedWidth - 42) / 2}px)`
        }
      }),
      '& a': {
        transition: `transform ${transitionDuration}ms ease`
      }
    },
    '& .ts-vertical-nav-menu-label': {
      fontSize: '0.6875rem',
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--mui-palette-text-disabled)',
      paddingBlock: '12px 8px',
      paddingInline: theme.spacing(3),
      margin: 0,
      lineHeight: 1.2
    },
    [`& .${verticalNavClasses.container}`]: {
      transition: theme.transitions.create(['inline-size', 'inset-inline-start', 'box-shadow'], {
        duration: transitionDuration,
        easing: 'ease-in-out'
      }),
      borderColor: 'transparent',
      ...(collapsedHovered && {
        boxShadow: 'var(--mui-customShadows-lg)'
      }),
      [`& .${verticalNavClasses.toggled}`]: {
        boxShadow: 'var(--mui-customShadows-lg)'
      },
      '[data-skin="bordered"] &': {
        borderColor: 'var(--mui-palette-divider)'
      }
    },
    [`& .${verticalNavClasses.header} > span svg`]: {
      transition: `transform ${transitionDuration}ms ease-in-out`,
      transform: `rotate(${collapsedHovered ? '180deg' : '0deg'})`,
      '[dir="rtl"] &': {
        transform: `rotate(${collapsedHovered ? '0deg' : '180deg'})`
      }
    },
    [`& .${menuClasses.menuSectionContent}`]: {
      color: 'var(--mui-palette-text-disabled)'
    },
    [`& .${menuClasses.root}`]: {
      paddingBlock: '8px 16px',
      paddingInline: theme.spacing(2.5)
    },
    [`& .${verticalNavClasses.backdrop}`]: {
      backgroundColor: 'var(--backdrop-color)'
    }
  }
}

export default navigationCustomStyles
