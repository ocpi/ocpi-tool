import { V211Version } from "../ocpimsgs/versionGetDetailResponse.schema";
import {
  OcpiEndpoint,
  OcpiResponse,
  ocpiRequestRetryingAuthTokenBase64,
  setSession,
} from "../ocpi-request";

export const login = async (
  platformVersionsUrl: string,
  token: string,
  partyId: string
) => {
  let ocpiResponse!: OcpiResponse<V211Version>;

  try {
    ocpiResponse = await ocpiRequestRetryingAuthTokenBase64<V211Version>(
      "get",
      platformVersionsUrl,
      token
    );
  } catch (err) {
    throw new Error(
      "Oopsie, login failed: " +
        (err && typeof err == "object" && "message" in err
          ? err.message
          : "(no error message)")
    );
  }

  if (Array.isArray(ocpiResponse.data)) {
    const versions = ocpiResponse.data as { version: string; url: string }[];
    console.info(
      "It's a versions endpoint; please pick one of the version URLs to log in to:"
    );
    versions.forEach((v) => console.info(`\t${v.version}\t${v.url}`));
  } else if (
    typeof ocpiResponse.data == "object" &&
    ocpiResponse.data.version
  ) {
    const version = ocpiResponse.data as V211Version;
    console.info(`It's a version endpoint; version is ${version}`);
    await setSession({
      version: version.version,
      endpoints: version.endpoints as unknown as OcpiEndpoint[],
      token,
      partyId,
    });
    console.info(`Logged in to ${platformVersionsUrl}`);
  } else {
    console.info(
      `The URL at ${platformVersionsUrl} doesn't seem to be any kind of OCPI endpoint`
    );
  }
};
