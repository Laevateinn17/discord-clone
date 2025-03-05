
const STORAGE_ENDPOINT = `https://${process.env.NEXT_PUBLIC_AWS_BUCKET}.s3-${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`

export function getImageURL(prefix: string, fileName: string) {
    return `${STORAGE_ENDPOINT}/${prefix}/${fileName}`;
}
