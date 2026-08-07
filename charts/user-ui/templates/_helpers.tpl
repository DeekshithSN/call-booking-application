{{- define "user-ui.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "user-ui.name" -}}
{{- .Chart.Name -}}
{{- end -}}
