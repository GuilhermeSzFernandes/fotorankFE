import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
        <div className="w-full max-w-xs enter-1">
          <div className="mb-8">
            <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4">Recuperação</p>
            <h1 className="font-display text-4xl italic text-ink leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
              Verifique seu e-mail
            </h1>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.
              Confira sua caixa de entrada e a pasta de spam. O link é válido por 1 hora.
            </p>
          </div>

          <Link to="/login" className="btn-primary w-full block text-center mb-4">
            Voltar ao login
          </Link>

          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className="block w-full text-center text-xs text-ink-muted hover:text-ink transition-colors"
          >
            Usar outro e-mail
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
      <div className="w-full max-w-xs">
        <div className="mb-10 enter-1">
          <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4">Recuperação</p>
          <h1 className="font-display text-5xl italic text-ink leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
            Esqueci a senha
          </h1>
          <p className="text-xs text-ink-secondary">
            Informe seu e-mail para receber o link de recuperação.
          </p>
        </div>

        {error && (
          <div className="enter-2 text-red-400/80 text-xs mb-5 px-3 py-2.5 border border-red-900/30 rounded-sm bg-red-900/5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 enter-2">
          <div>
            <label className="flabel">E-mail</label>
            <input
              type="email"
              className="field"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Gerando link…' : 'Enviar link'}
          </button>
        </form>

        <Link
          to="/login"
          className="block text-center text-xs text-ink-muted hover:text-ink transition-colors mt-8"
        >
          ← Voltar ao login
        </Link>
      </div>
    </div>
  );
}
