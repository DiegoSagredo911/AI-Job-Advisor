import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Sparkles,
  AlertTriangle,
  Scale,
  ArrowLeft,
  HardDrive,
  UserCheck,
  FileText,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones de Uso | AI Job Advisor",
  description:
    "Términos de servicio, política de privacidad local-first y condiciones de uso de la plataforma AI Job Advisor.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 sm:py-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mis Postulaciones
        </Link>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            Transparencia & Privacidad
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Bienvenido a <strong>AI Job Advisor</strong>. Esta página describe cómo funciona la plataforma, 
            el tratamiento 100% privado de tus datos mediante arquitectura <em>Local-First</em>, el uso de tu propia 
            API Key de Google Gemini y las responsabilidades del usuario.
          </p>
          <div className="text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            Última actualización: Noviembre 2026 · Licencia GNU GPL v3
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">100% Local-First</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sin bases de datos en la nube. Tu CV, postulaciones y respuestas viven únicamente en tu navegador.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <KeyRound className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">Tu Propia Clave (BYOK)</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Usas tu propia API Key de Google Gemini. Tienes control absoluto de tu cuota y nunca se almacena en servidores.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">Asesoría con IA</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Recomendaciones y simulaciones basadas en modelos LLM para potenciar tu empleabilidad.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-white">Código Abierto</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Software libre bajo licencia GNU GPL v3. Uso gratuito, educativo y comunitario sin fines de lucro.
          </p>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-slate-300 text-sm leading-relaxed">
        {/* Section 1 */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-white font-bold text-base sm:text-lg">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs">
              1
            </div>
            <h2>Naturaleza y Finalidad del Proyecto</h2>
          </div>
          <p>
            <strong>AI Job Advisor</strong> es una plataforma de software desarrollada para asistir a postulantes y 
            profesionales en el análisis técnico de ofertas laborales, cálculo de afinidad frente a filtros ATS 
            (Applicant Tracking Systems), generación de versiones adaptadas de currículum vitae y simulación interactiva 
            de entrevistas técnicas y conductuales.
          </p>
          <p>
            El software ha sido creado y diseñado originalmente por <strong>Diego Ignacio Sagredo Ailef</strong> como una 
            herramienta comunitaria y de uso libre bajo la <strong>Licencia Pública General de GNU versión 3 (GNU GPL v3)</strong>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-white font-bold text-base sm:text-lg">
            <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center text-xs">
              2
            </div>
            <h2>Privacidad de Datos y Arquitectura Local-First</h2>
          </div>
          <p>
            A diferencia de plataformas convencionales que almacenan tus datos personales en bases de datos centralizadas, 
            <strong> AI Job Advisor opera bajo un paradigma 100% Local-First</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>
              <strong>Almacenamiento exclusivo en tu navegador</strong>: Toda tu información personal (nombre, datos de contacto, 
              experiencia laboral, educación, currículums subidos en PDF/DOCX, postulaciones guardadas y transcripciones 
              de entrevistas) se almacena únicamente en el <code>localStorage</code> del navegador del usuario.
            </li>
            <li>
              <strong>Sin base de datos central</strong>: El proyecto no dispone de bases de datos remotas ni servidores 
              de persistencia que recopilen, indexen o conserven tus datos en la nube.
            </li>
            <li>
              <strong>Control y eliminación total</strong>: Tienes la potestad absoluta sobre tus datos. Puedes editar cualquier 
              campo en cualquier momento o hacer clic en <em>&quot;Reiniciar Perfil&quot;</em> en el panel de configuración para 
              borrar de forma instantánea e irreversible toda tu información del navegador.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-white font-bold text-base sm:text-lg">
            <div className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center text-xs">
              3
            </div>
            <h2>Política de API Key (Bring Your Own Key - BYOK)</h2>
          </div>
          <p>
            Para realizar tareas de inteligencia artificial (análisis de vacantes, generación de CVs a medida y simulación 
            de entrevistas), la plataforma requiere que cada usuario proporcione su propia <strong>API Key de Google Gemini</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>
              La clave de API se ingresa en el modal de configuración de la barra superior y se guarda de manera segura y 
              local en tu navegador. <strong>Nunca es registrada ni transferida a servidores de terceros</strong> ajenos al 
              servicio oficial de Google Gemini.
            </li>
            <li>
              Cada llamada de análisis o entrevista viaja directamente utilizando las credenciales provistas por el usuario.
            </li>
            <li>
              El usuario es el único responsable de la obtención de su API Key a través de{" "}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>{" "}
              y de la gestión de sus cuotas de uso y límites de velocidad.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-white font-bold text-base sm:text-lg">
            <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center text-xs">
              4
            </div>
            <h2>Descargo de Responsabilidad sobre la IA (Disclaimer)</h2>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Advertencia Importante sobre Modelos de Lenguaje</span>
              <p className="text-amber-200/90 leading-relaxed">
                Los puntajes de compatibilidad, evaluaciones técnicas, recomendaciones salariales y sugerencias de respuestas 
                son estimaciones generadas mediante Inteligencia Artificial probabilística (Google Gemini). Deben emplearse 
                únicamente con fines orientativos y de preparación.
              </p>
            </div>
          </div>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>
              <strong>Sin garantía de contratación</strong>: El uso de esta plataforma no asegura la obtención de empleos, 
              entrevistas efectivas ni resultados positivos en procesos de selección reales.
            </li>
            <li>
              <strong>Supervisión humana obligatoria</strong>: Es responsabilidad exclusiva del usuario revisar, corregir y validar 
              la veracidad de toda información generada antes de postular a una vacante o presentar su currículum ante reclutadores.
            </li>
            <li>
              <strong>Precisión de datos salariales</strong>: Los rangos salariales y condiciones de mercado sugeridas son estimaciones 
              referenciales basadas en la descripción del puesto y pueden diferir de las ofertas reales de las empresas contratantes.
            </li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-white font-bold text-base sm:text-lg">
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center text-xs">
              5
            </div>
            <h2>Licencia de Software y Derechos de Autor</h2>
          </div>
          <p>
            El código fuente de este proyecto se encuentra protegido y distribuido bajo los términos de la{" "}
            <strong>Licencia Pública General de GNU versión 3 (GNU GPL v3)</strong>:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-slate-300">
            <li>
              <strong>Libertad de uso y estudio</strong>: Puedes usar, estudiar y modificar este software libremente para fines personales 
              o comunitarios.
            </li>
            <li>
              <strong>Reconocimiento de autoría obligatorio</strong>: Cualquier redistribución, fork o trabajo derivado debe mantener 
              de forma visible el reconocimiento expreso a <strong>Diego Ignacio Sagredo Ailef</strong> como autor y desarrollador original.
            </li>
            <li>
              <strong>Sin fines de lucro / Prohibida su venta cerrada</strong>: Este proyecto se distribuye con la finalidad de ayudar 
              a la comunidad. Está terminantemente prohibida la venta directa de este software o su distribución como servicio comercial 
              privativo cerrado sin cumplir con la reciprocidad estipulada en la licencia GNU GPL v3.
            </li>
            <li>
              <strong>Misma licencia</strong>: Cualquier modificación o software derivado debe ser publicado bajo esta misma licencia pública 
              y gratuita.
            </li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-white font-bold text-base sm:text-lg">
            <div className="w-7 h-7 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center text-xs">
              6
            </div>
            <h2>Contacto y Soporte</h2>
          </div>
          <p>
            Si tienes dudas técnicas, sugerencias de mejora o deseas contribuir al proyecto:
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="https://www.linkedin.com/in/diego-sagredo/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
              LinkedIn del Desarrollador
            </a>
            <a
              href="https://github.com/DiegoSagredo911/AI-Job-Advisor"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              Repositorio en GitHub
            </a>
          </div>
        </section>
      </div>

      {/* Footer link back */}
      <div className="text-center pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-lg shadow-blue-600/20"
        >
          <ArrowLeft className="w-4 h-4" />
          Comenzar a Usar AI Job Advisor
        </Link>
      </div>
    </div>
  );
}
