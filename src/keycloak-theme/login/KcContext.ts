import type { ExtendKcContext } from "keycloakify/login";
import type { KcEnvName, ThemeName } from "../kc.gen";

export type KcContextExtension = {
    themeName: ThemeName;
    properties: Record<KcEnvName, string> & {};
    // NOTE: Here you can declare more properties to extend the KcContext
    // See: https://docs.keycloakify.dev/faq-and-help/some-values-you-need-are-missing-from-in-kccontext
};

export type KcContextExtensionPerPage = {
    // Keycloak sets the account's username here (the address, with e-mail as username). After the
    // link in the verification mail, auth.attemptedUsername is empty on this page.
    "login-update-password.ftl": { username?: string };
};

export type KcContext = ExtendKcContext<KcContextExtension, KcContextExtensionPerPage>;
