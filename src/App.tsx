import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from '@/components/Layout'
import { AppProvider } from '@/stores/useAppStore'

import Index from './pages/Index'
import RegistrarVisita from './pages/RegistrarVisita'
import ImportarDados from './pages/ImportarDados'
import Clientes from './pages/Clientes'
import Ranking from './pages/Ranking'
import Industrias from './pages/Industrias'
import Vendedores from './pages/Vendedores'
import Configuracoes from './pages/Configuracoes'
import NotFound from './pages/NotFound'

const App = () => (
  <AppProvider>
    <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/registrar" element={<RegistrarVisita />} />
            <Route path="/importar" element={<ImportarDados />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/industrias" element={<Industrias />} />
            <Route path="/vendedores" element={<Vendedores />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </AppProvider>
)

export default App
