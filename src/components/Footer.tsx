
export function Footer() {
  const handleHelpClick = () => {
    window.location.href = 'mailto:danilo.s.loureiro2@gmail.com?subject=Ajuda - Sistema de Gerência de Projetos';
  };

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/odanpietro', '_blank');
  };

  return (
    <footer className="bg-gray-50 border-t py-4 px-6 mt-8">
      <div className="container flex items-center justify-between text-sm text-gray-600">
        <div>
          © 2025 Sistema de Gerência de Projetos - Criado por{' '}
          <button 
            onClick={handleInstagramClick}
            className="text-blue-600 hover:text-blue-800 underline font-medium"
          >
            Danilo Araujo
          </button>
        </div>
        <button 
          onClick={handleHelpClick}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          Obter ajuda
        </button>
      </div>
    </footer>
  );
}
