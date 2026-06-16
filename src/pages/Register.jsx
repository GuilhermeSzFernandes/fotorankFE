import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { ETECS } from '../data/etecs';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirm: '',
    etec: '', studentType: '', cpf: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) return setError('As senhas não coincidem.');
    if (!form.cpf.trim()) return setError('CPF é obrigatório.');
    if (!form.phone.trim()) return setError('Telefone é obrigatório.');
    setLoading(true);
    try {
      const { data } = await axios.post('/api/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        etec: form.etec || null,
        studentType: form.studentType || null,
        cpf: form.cpf.trim(),
        phone: form.phone.trim(),
      });
      login(data.user);
      navigate('/upload');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-48px)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xs">

        <div className="mb-10 enter-1">
          <p className="text-2xs text-ink-muted uppercase mb-4 tracking-widest">Inscrição</p>
          <h1 className="font-display text-5xl italic text-ink leading-none mb-3" style={{ letterSpacing: '-0.02em' }}>
            Criar conta
          </h1>
          <p className="text-xs text-ink-secondary">Participe do concurso de fotografia.</p>
        </div>

        {error && (
          <div className="enter-2 text-red-400/80 text-xs mb-5 px-3 py-2.5 border border-red-900/30 rounded-sm bg-red-900/5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 enter-2">
          <div>
            <label className="flabel">Nome completo</label>
            <input type="text" className="field" placeholder="Seu nome"
              value={form.name} onChange={set('name')} autoFocus required />
          </div>

          <div>
            <label className="flabel">E-mail</label>
            <input type="email" className="field" placeholder="seu@email.com"
              value={form.email} onChange={set('email')} required />
          </div>

          <div>
            <label className="flabel">ETEC</label>
            <select className="field" value={form.etec} onChange={set('etec')}>
              <option value="">Selecione sua ETEC</option>
              {ETECS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="flabel">Tipo de aluno</label>
            <select className="field" value={form.studentType} onChange={set('studentType')}>
              <option value="">Selecione</option>
              <option value="aluno">Aluno</option>
              <option value="ex-aluno">Ex-aluno</option>
            </select>
          </div>

          <div>
            <label className="flabel">CPF</label>
            <input type="text" className="field" placeholder="000.000.000-00"
              value={form.cpf} onChange={set('cpf')} required />
          </div>

          <div>
            <label className="flabel">Telefone</label>
            <input type="tel" className="field" placeholder="(00) 00000-0000"
              value={form.phone} onChange={set('phone')} required />
          </div>

          <div>
            <label className="flabel">Senha</label>
            <input type="password" className="field" placeholder="Mínimo 6 caracteres"
              value={form.password} onChange={set('password')} required />
          </div>

          <div>
            <label className="flabel">Confirmar senha</label>
            <input type="password" className="field" placeholder="Repita a senha"
              value={form.confirm} onChange={set('confirm')} required />
          </div>

          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </button>
        </form>

        <p className="text-xs text-ink-muted mt-8 enter-3">
          Já tem conta?{' '}
          <Link to="/login" className="text-ink-secondary hover:text-ink underline underline-offset-4 decoration-ink-ghost transition-colors">
            Entrar
          </Link>
        </p>

      </div>
    </div>
  );
}
