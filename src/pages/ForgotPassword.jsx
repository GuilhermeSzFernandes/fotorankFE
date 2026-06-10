import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { resetToken, resetUrl }
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4">
        <div className="w-full max-w-xs enter-1">
          <div className="mb-8">
            <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4">Recuperação</p>
            <h1 className="font-display text-4xl italic text-ink leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
              Link gerado
            </h1>
            <p className="text-xs text-ink-secondary">
              Em produção, o link seria enviado ao e-mail. Para fins de demonstração:
            </p>
          </div>

          <div className="panel mb-6">
            <p className="text-2xs text-ink-muted uppercase tracking-widest mb-3">Link de recuperação</p>
            <div
              onClick={() => navigate(result.resetUrl)}
              className="cursor-pointer font-mono text-xs text-ink-secondary break-all hover:text-ink transition-colors underline underline-offset-4 decoration-line-strong"
            >
              {result.resetUrl}
            </div>
          </div>

          <button
            onClick={() => navigate(result.resetUrl)}
            className="btn-primary w-full mb-4"
          >
            Ir para redefinição →
          </button>

          <Link to="/login" className="block text-center text-xs text-ink-muted hover:text-ink transition-colors">
            Voltar ao login
          </Link>
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
