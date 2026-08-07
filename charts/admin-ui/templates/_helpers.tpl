{{- define "admin-ui.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "admin-ui.name" -}}
{{- .Chart.Name -}}
{{- end -}}
