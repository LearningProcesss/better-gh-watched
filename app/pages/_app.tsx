import {
  AppProps,
  ErrorBoundary,
  ErrorComponent,
  AuthenticationError,
  AuthorizationError,
  ErrorFallbackProps,
  useQueryErrorResetBoundary,
} from "blitz"
import LoginForm from "app/auth/components/LoginForm"
import { ContextDiServicesProvider, defaultAppContext } from "app/core/hooks"
import { MantineProvider, ColorSchemeProvider, ColorScheme } from '@mantine/core'
import { NotificationsProvider } from '@mantine/notifications'

export default function App({ Component, pageProps }: AppProps) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    // <ErrorBoundary
    //   FallbackComponent={RootErrorFallback}
    //   onReset={useQueryErrorResetBoundary().reset}
    // >
    //   {getLayout(<Component {...pageProps} />)}
    // </ErrorBoundary>
    <ErrorBoundary FallbackComponent={RootErrorFallback} onReset={useQueryErrorResetBoundary().reset}>
      <ContextDiServicesProvider value={defaultAppContext}>
        {/* <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}> */}
        <MantineProvider>
          <NotificationsProvider position="top-right">
            {getLayout(<Component {...pageProps} />)}
          </NotificationsProvider>
        </MantineProvider>
        {/* </ColorSchemeProvider> */}
      </ContextDiServicesProvider>
    </ErrorBoundary >
  )
}

function RootErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  if (error instanceof AuthenticationError) {
    return <LoginForm onSuccess={resetErrorBoundary} />
  } else if (error instanceof AuthorizationError) {
    return (
      <ErrorComponent
        statusCode={error.statusCode}
        title="Sorry, you are not authorized to access this"
      />
    )
  } else {
    return (
      <ErrorComponent statusCode={error.statusCode || 400} title={error.message || error.name} />
    )
  }
}
