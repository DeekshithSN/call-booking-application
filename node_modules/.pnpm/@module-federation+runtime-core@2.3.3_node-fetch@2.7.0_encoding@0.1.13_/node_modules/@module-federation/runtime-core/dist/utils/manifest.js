//#region src/utils/manifest.ts
function matchRemoteWithNameAndExpose(remotes, id) {
	for (const remote of remotes) {
		const isNameMatched = id.startsWith(remote.name);
		let expose = id.replace(remote.name, "");
		if (isNameMatched) {
			if (expose.startsWith("/")) {
				const pkgNameOrAlias = remote.name;
				expose = `.${expose}`;
				return {
					pkgNameOrAlias,
					expose,
					remote
				};
			} else if (expose === "") return {
				pkgNameOrAlias: remote.name,
				expose: ".",
				remote
			};
		}
		const isAliasMatched = remote.alias && id.startsWith(remote.alias);
		let exposeWithAlias = remote.alias && id.replace(remote.alias, "");
		if (remote.alias && isAliasMatched) {
			if (exposeWithAlias && exposeWithAlias.startsWith("/")) {
				const pkgNameOrAlias = remote.alias;
				exposeWithAlias = `.${exposeWithAlias}`;
				return {
					pkgNameOrAlias,
					expose: exposeWithAlias,
					remote
				};
			} else if (exposeWithAlias === "") return {
				pkgNameOrAlias: remote.alias,
				expose: ".",
				remote
			};
		}
	}
}
function matchRemote(remotes, nameOrAlias) {
	for (const remote of remotes) {
		if (nameOrAlias === remote.name) return remote;
		if (remote.alias && nameOrAlias === remote.alias) return remote;
	}
}

//#endregion
export { matchRemote, matchRemoteWithNameAndExpose };
//# sourceMappingURL=manifest.js.map