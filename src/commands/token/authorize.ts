import {exit, stderr} from "node:process";
import {
  ModuleID,
  NoSuchEndpoint,
  OcpiModule,
  OcpiPageParameters,
  ocpiRequest,
  OcpiRequestMethod,
  OcpiResponse,
  tokens
} from "../../ocpi-request"
import {loadSession, LoginSession} from "../../login-session";

type OcpiTokenAuthorizationInfo = {
  allowed: string,
}

export const authorize = async (uid: string) => {
  // const module = getModuleByName(moduleName);

  if (uid == null) {
    stderr.write(`No uid given\n`);
    exit(1);
  }

  const session = await loadSession();

  let ocpiResponse!: OcpiResponse<OcpiTokenAuthorizationInfo> | "no such endpoint";

  try {
    ocpiResponse = await requestData(session, tokens, "post", `/${uid}/authorize`);
  } catch (err) {
    throw new Error(
        "Oopsie, login failed: " +
        (err && typeof err == "object" && "message" in err
            ? err.message
            : "(no error message)")
    );
  }

  if (ocpiResponse === "no such endpoint") {
    throw new Error(`no endpoint found for module tokens`);
  }

  console.info("Token validation status: " + ocpiResponse.data.allowed);
};

// todo: move to generic TS module
async function requestData<T, N extends ModuleID>(
    session: LoginSession,
    module: OcpiModule<N>,
    method: OcpiRequestMethod = "get",
    uri?: string,
    page?: OcpiPageParameters

): Promise<OcpiResponse<T> | NoSuchEndpoint> {
  const fromPartyId = session.version === "2.2.1" ? session.partyId : undefined;

  const moduleUrl = session.endpoints.find(
      (ep) => ep.identifier === module.name && ep.role !== "RECEIVER"
  );

  if (moduleUrl) {
    return ocpiRequest(
        session,
        method,
        `${moduleUrl.url}${uri}`,
        fromPartyId
    );
  } else return "no such endpoint";
};