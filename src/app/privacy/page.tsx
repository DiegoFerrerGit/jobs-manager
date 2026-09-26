import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - Jobs Manager",
  description: "Privacy policy and terms of service for Jobs Manager.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
      
      <div className="glass-card max-w-3xl w-full p-8 md:p-12 rounded-3xl relative z-10 overflow-y-auto max-h-[90vh]">
        <Link 
          href="/login" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Volver al inicio de sesión
        </Link>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-8">
          Política de Privacidad
        </h1>

        <div className="space-y-6 text-foreground/80 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">1. Información que recopilamos</h2>
            <p>
              Cuando inicias sesión en Jobs Manager a través de Google, únicamente recopilamos la información básica de tu perfil público que nos proporcionas explícitamente: tu dirección de correo electrónico, nombre y foto de perfil. No accedemos a tus contraseñas ni a otros datos privados de tu cuenta de Google.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">2. Uso de tu información</h2>
            <p>
              La información recopilada se utiliza exclusivamente para:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Autenticarte y permitirte acceder a la aplicación.</li>
              <li>Asociar los datos de tus búsquedas y aplicaciones de trabajo a tu cuenta personal.</li>
              <li>Personalizar tu experiencia dentro de la plataforma.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">3. Protección y privacidad de datos</h2>
            <p>
              Nos tomamos en serio tu privacidad. No vendemos, alquilamos ni compartimos tu información personal con terceros bajo ninguna circunstancia. Tus datos están seguros y solo tú tienes acceso a los registros de tus aplicaciones de empleo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">4. Eliminación de datos</h2>
            <p>
              Si en algún momento deseas revocar nuestro acceso o eliminar tu cuenta junto con toda tu información relacionada, puedes hacerlo y tus datos serán eliminados permanentemente de nuestra base de datos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-2">5. Contacto</h2>
            <p>
              Si tienes alguna duda o inquietud sobre cómo manejamos tus datos, la aplicación se encuentra en fase Beta cerrada y puedes contactar directamente al administrador para cualquier consulta relacionada.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
