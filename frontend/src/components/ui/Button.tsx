interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Define a hierarquia visual do botão.
   * - `primary`: Ação principal da tela (Azul Royal)
   * - `secondary`: Ações de apoio (Cinza/Outline)
   * - `danger`: Ações destrutivas (Excluir, Cancelar)
   */
  variant?: 'primary' | 'secondary' | 'danger';
  
  /**
   * Se true, mostra um spinner e bloqueia o clique.
   * @default false
   */
  isLoading?: boolean;
}

/**
 * Botão Padrão do Health Engine Pro.
 * Utiliza as cores globais definidas em globals.css.
 * * @example
 * <Button variant="primary" onClick={save}>Salvar</Button>
 */
export function Button({ variant = 'primary', isLoading, children, ...props }: ButtonProps) {
  // Implementação...
}