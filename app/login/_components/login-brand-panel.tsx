import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/app/components/ui-icon";

/** Metade institucional da tela de login (marca e destaques do painel). */
export function LoginBrandPanel() {
    return (
        <section aria-label="Identidade do Farol" className="login-brand-panel">
            <div className="login-brand-art" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
            <div className="login-brand-content">
                <Link className="brand login-brand" href="/">
                    <Image
                        alt=""
                        className="login-brand-logo"
                        height={58}
                        src="/farol-logo.png"
                        width={58}
                    />
                    <span>
                        <strong>Farol</strong>
                        <small>ADMINISTRAÇÃO</small>
                    </span>
                </Link>


                <h2>Trânsito urbano seguro e em tempo real.</h2>
                <p>
                    Plataforma dedicada à gestão de relatos e à análise das
                    informações enviadas pela comunidade.
                </p>
                <div className="login-feature-list">
                    <article className="login-feature">
                        <span className="login-feature-icon"><Icon name="lock" /></span>
                        <span>
                            <strong>Gestão responsável</strong>
                            <small>Acesso destinado à equipe autorizada</small>
                        </span>
                        <Icon className="login-feature-check" name="check" />
                    </article>
                    <article className="login-feature">
                        <span className="login-feature-icon"><Icon name="reports" /></span>
                        <span>
                            <strong>Relatos da comunidade</strong>
                            <small>Informações organizadas para análise</small>
                        </span>
                        <Icon className="login-feature-check" name="check" />
                    </article>
                    <article className="login-feature">
                        <span className="login-feature-icon"><Icon name="users" /></span>
                        <span>
                            <strong>Moderação centralizada</strong>
                            <small>Apoio à equipe do Farol</small>
                        </span>
                        <Icon className="login-feature-check" name="check" />
                    </article>
                </div>
            </div>
            <div className="login-brand-footer">
                <span>Portal institucional</span>
            </div>
        </section>
    );
}
